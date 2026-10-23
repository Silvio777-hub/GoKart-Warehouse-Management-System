package com.swam.rest;

import com.swam.dtos.UserDTO;
import com.swam.mappers.UserMapper;
import com.swam.model.User;
import com.swam.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import java.io.IOException;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Endpoint for user management and profile settings.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@io.swagger.v3.oas.annotations.tags.Tag(name = "User Management", description = "Operations for managing system users")
public class UserREST {
    private final UserService service;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final com.swam.service.AuditService auditService; // Injected

    public UserREST(UserService service, UserMapper mapper, PasswordEncoder passwordEncoder,
            com.swam.service.AuditService auditService) {
        this.service = service;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @io.swagger.v3.oas.annotations.Operation(summary = "List all users", description = "Returns a list of all users. Accessible by ADMIN and MANAGER.")
    public List<UserDTO> list() {
        return service.list().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<UserDTO> getMe(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null)
            return ResponseEntity.status(401).build();
        User u = service.findByUsername(auth.getName());
        return u != null ? ResponseEntity.ok(mapper.toDTO(u)) : ResponseEntity.notFound().build();
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<UserDTO> updateMe(org.springframework.security.core.Authentication auth,
            @RequestBody UserDTO dto) {
        if (auth == null || auth.getName() == null)
            return ResponseEntity.status(401).build();
        User existing = service.findByUsername(auth.getName());
        if (existing == null)
            return ResponseEntity.notFound().build();
        existing.setFullName(dto.getFullName());
        existing.setEmail(dto.getEmail());
        existing.setBio(dto.getBio());
        User saved = java.util.Objects.requireNonNull(service.save(existing));
        auditService.log("UPDATE_PROFILE", auth.getName(), "Updated profile bio/fullname/email");
        return ResponseEntity.ok(mapper.toDTO(saved));
    }

    @GetMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getAvatar(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null)
            return ResponseEntity.status(401).build();
        User u = service.findByUsername(auth.getName());
        if (u == null || u.getProfilePicture() == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noCache().mustRevalidate())
                .contentType(MediaType
                        .parseMediaType(u.getProfilePictureType() != null ? u.getProfilePictureType() : "image/png"))
                .body(u.getProfilePicture());
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> uploadAvatar(org.springframework.security.core.Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (auth == null || auth.getName() == null)
            return ResponseEntity.status(401).build();
        User u = service.findByUsername(auth.getName());
        if (u == null)
            return ResponseEntity.notFound().build();

        // New higher limit: 50MB
        if (file.getSize() > 50 * 1024 * 1024)
            return ResponseEntity.badRequest().build();

        u.setProfilePicture(file.getBytes());
        u.setProfilePictureType(file.getContentType());
        service.save(u);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<Void> deleteAvatar(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null)
            return ResponseEntity.status(401).build();
        User u = service.findByUsername(auth.getName());
        if (u == null)
            return ResponseEntity.notFound().build();
        u.setProfilePicture(null);
        u.setProfilePictureType(null);
        service.save(u);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/avatar")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getUserAvatar(@PathVariable Long id) {
        User u = service.find(id).orElse(null);
        if (u == null || u.getProfilePicture() == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noCache().mustRevalidate())
                .contentType(MediaType
                        .parseMediaType(u.getProfilePictureType() != null ? u.getProfilePictureType() : "image/png"))
                .body(u.getProfilePicture());
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(org.springframework.security.core.Authentication auth,
            @RequestBody Map<String, String> payload) {
        User existing = service.findByUsername(auth.getName());
        if (existing == null)
            return ResponseEntity.notFound().build();
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (passwordEncoder.matches(currentPassword, existing.getPassword())) {
            existing.setPassword(passwordEncoder.encode(newPassword));
            service.save(existing);
            auditService.log("CHANGE_PASSWORD", auth.getName(), "Password changed successfully");
            return ResponseEntity.ok().build();
        } else {
            auditService.log("CHANGE_PASSWORD_FAIL", auth.getName(), "Invalid current password provided");
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> get(@PathVariable Long id) {
        return service.find(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new user", description = "Creates a new system user. Accessible by ADMIN only.")
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO dto,
            org.springframework.security.core.Authentication auth) {
        User u = mapper.toEntity(dto);
        // Encode password before saving!
        if (u.getPassword() != null && !u.getPassword().isEmpty()) {
            u.setPassword(passwordEncoder.encode(u.getPassword()));
        }
        User saved = java.util.Objects.requireNonNull(service.save(u));
        auditService.log("CREATE_USER", auth.getName(),
                "Created user: " + saved.getUsername() + " (" + saved.getRole() + ")");
        return ResponseEntity.created(java.util.Objects.requireNonNull(URI.create("/api/users/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        User requester = service.findByUsername(auth.getName());
        return service.find(id).map(target -> {
            boolean isManager = "MANAGER".equals(requester.getRole());
            boolean targetIsStaff = "STAFF".equals(target.getRole());

            // Manager can only delete Staff
            if (isManager && !targetIsStaff) {
                return ResponseEntity.status(403).<Void>build();
            }

            // Admin cannot delete other Admins (or themselves)
            if ("ADMIN".equals(target.getRole())) {
                return ResponseEntity.status(403).<Void>build();
            }

            service.delete(id);
            auditService.log("DELETE_USER", auth.getName(), "Deleted user: " + target.getUsername());
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trash")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<UserDTO> listTrash() {
        return service.listTrash().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        // We verify the user exists (even if deleted)
        if (service.find(id).isPresent()) {
            service.restore(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
