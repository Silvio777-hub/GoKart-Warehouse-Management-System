package com.swam.rest;

import com.swam.dtos.DocumentDTO;
import com.swam.model.Document;
import com.swam.repository.DocumentRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Endpoint for File Management.
 * Allows users to upload documents and Admins to view/download them.
 */
@RestController
@RequestMapping("/api/documents")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Document Management", description = "File uploads and resource management (PDF, JPG, PNG)")
public class DocumentREST {

    private final DocumentRepository docRepo;

    public DocumentREST(DocumentRepository docRepo) {
        this.docRepo = docRepo;
    }

    /**
     * List all documents.
     * Visible to all authenticated users (or restricted to Admin/Manager depending
     * on requirements).
     */
    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List all documents", description = "Returns a list of metadata for all uploaded files. Accessible by ADMIN and MANAGER.")
    public ResponseEntity<?> list(Authentication auth) {
        boolean hasPermission = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));

        if (!hasPermission) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. Managers and Admins only."));
        }

        List<DocumentDTO> docs = docRepo.findAllByOrderByUploadedAtDesc().stream()
                .map(d -> new DocumentDTO(
                        d.getId(),
                        d.getFilename(),
                        d.getUploadedBy(),
                        d.getUploadedAt(),
                        d.getData() != null ? d.getData().length : 0))
                .collect(Collectors.toList());
        return ResponseEntity.ok(docs);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(summary = "Upload a document", description = "Uploads a new file (Max 5MB). Allowed: PDF, JPG, PNG, DOC, DOCX.")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, Authentication auth) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty or missing"));
            }

            // 1. Check file size (e.g. max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File too large. Max 5MB allowed."));
            }

            // 2. Validate Extension (Allow-list)
            String originalName = file.getOriginalFilename();
            if (originalName == null)
                originalName = "unknown";

            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalName.substring(dotIndex).toLowerCase();
            }

            List<String> allowedExtensions = Arrays.asList(".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx");
            if (!allowedExtensions.contains(extension)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "File type not allowed. Please upload PDF, JPG, or PNG."));
            }

            // 3. Sanitize Filename (Prevent path traversal)
            String sanitizedName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

            Document doc = new Document();
            doc.setFilename(sanitizedName);
            doc.setContentType(file.getContentType());
            doc.setData(file.getBytes());
            doc.setUploadedBy(auth.getName());

            docRepo.save(doc);
            return ResponseEntity.ok(Map.of("message", "File uploaded successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error reading file data"));
        }
    }

    /**
     * Download a file.
     * Accessible by authenticated users.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> download(@PathVariable long id, Authentication auth) {
        boolean hasPermission = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));

        if (!hasPermission) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. Managers and Admins only."));
        }

        return docRepo.findById(id).map(doc -> {
            String contentType = doc.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(doc.getData());
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a file (Admin and Manager only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id, Authentication auth) {
        boolean hasPermission = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));

        if (!hasPermission) {
            return ResponseEntity.status(403).build();
        }

        docRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
