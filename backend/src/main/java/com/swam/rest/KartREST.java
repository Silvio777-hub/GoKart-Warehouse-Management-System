package com.swam.rest;

import com.swam.dtos.KartDTO;
import com.swam.mappers.KartMapper;
import com.swam.model.Kart;
import com.swam.service.KartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;

/**
 * KartREST - Controller for managing Go-Karts.
 * This class provides standard REST endpoints (GET, POST, PUT, DELETE)
 * so the frontend can display and modify kart data.
 */
@RestController
@RequestMapping("/api/karts")
@CrossOrigin("*")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Kart Management", description = "Fleet management and status tracking for Go-Karts")
public class KartREST {
    private final KartService service;
    private final KartMapper mapper;
    private final com.swam.service.AuditService auditService; // Injected

    // We use a Mapper to Convert between Database Entities and DTOs
    // This separates our internal data model from the API reference
    public KartREST(KartService service, KartMapper mapper, com.swam.service.AuditService auditService) {
        this.service = service;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @GetMapping("/summary")
    public ResponseEntity<java.util.Map<String, Long>> getSummary() {
        List<Kart> all = service.list();
        java.util.Map<String, Long> summary = new java.util.HashMap<>();
        summary.put("total", (long) all.size());
        summary.put("available", all.stream().filter(k -> "AVAILABLE".equals(k.getStatus())).count());
        summary.put("underMaintenance", all.stream()
                .filter(k -> "UNDER_MAINTENANCE".equals(k.getStatus()) || "MAINTENANCE".equals(k.getStatus())).count());
        summary.put("crashed", all.stream().filter(k -> "CRASHED".equals(k.getStatus())).count());
        summary.put("retired", all.stream().filter(k -> "RETIRED".equals(k.getStatus())).count());
        summary.put("other", all.stream().filter(k -> "OTHER".equals(k.getStatus())).count());
        return ResponseEntity.ok(summary);
    }

    /**
     * Get karts with pagination and search.
     * Accessible at: GET /api/karts?page=0&size=10&query=...
     */
    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Paginated list of karts", description = "Returns a paginated list of karts with optional filter query.")
    public ResponseEntity<org.springframework.data.domain.Page<KartDTO>> list(
            @org.springframework.data.web.PageableDefault(size = 12) org.springframework.data.domain.Pageable pageable,
            @RequestParam(required = false) String query) {

        org.springframework.data.domain.Page<KartDTO> result = service.list(pageable, query)
                .map(mapper::toDTO);

        return ResponseEntity.ok(result);
    }

    /**
     * Get a specific kart by ID.
     * Accessible at: GET /api/karts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<KartDTO> get(@PathVariable Long id) {
        return service.find(id)
                .map(mapper::toDTO) // If found, convert to DTO
                .map(ResponseEntity::ok) // Return 200 OK
                .orElse(ResponseEntity.notFound().build()); // If not found, return 404
    }

    /**
     * Create a new kart.
     * Accessible at: POST /api/karts
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<KartDTO> create(@Valid @RequestBody KartDTO dto,
            org.springframework.security.core.Authentication auth) {
        Kart entity = mapper.toEntity(dto);
        Kart saved = java.util.Objects.requireNonNull(service.save(entity));
        auditService.log("CREATE_KART", auth.getName(), "Created kart: " + saved.getCode());
        // Return 201 Created with the location of the new resource
        return ResponseEntity.created(java.util.Objects.requireNonNull(URI.create("/api/karts/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    /**
     * Update an existing kart.
     * Accessible at: PUT /api/karts/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<KartDTO> update(@PathVariable Long id, @RequestBody KartDTO dto,
            org.springframework.security.core.Authentication auth) {
        return service.find(id).map(existing -> {
            // Update only fields that are provided
            if (dto.getCode() != null)
                existing.setCode(dto.getCode());
            if (dto.getStatus() != null) {
                if (!dto.getStatus().equals(existing.getStatus())) {
                    auditService.log("UPDATE_KART_STATUS", auth.getName(),
                            "Kart " + existing.getCode() + ": " + existing.getStatus() + " -> " + dto.getStatus());
                }
                existing.setStatus(dto.getStatus());
            }
            if (dto.getStatusNote() != null)
                existing.setStatusNote(dto.getStatusNote());
            if (dto.getHoursRun() != null)
                existing.setHoursRun(dto.getHoursRun());

            Kart saved = java.util.Objects.requireNonNull(service.save(existing));
            return ResponseEntity.ok(mapper.toDTO(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a kart.
     * Accessible at: DELETE /api/karts/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        service.delete(id);
        auditService.log("DELETE_KART", auth.getName(), "Deleted kart ID: " + id);
        return ResponseEntity.noContent().build(); // Return 204 No Content
    }

    // Custom Actions for Quick Access Buttons

    @PostMapping("/{id}/crash")
    public ResponseEntity<Void> reportCrash(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        return service.find(id).map(k -> {
            k.setStatus("CRASHED");
            k.setStatusNote("Reported via Quick Crash Report");
            service.save(k);
            auditService.log("REPORT_CRASH", auth.getName(), "Reported crash for kart: " + k.getCode());
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/pitstop")
    public ResponseEntity<Void> pitStop(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        return service.find(id).map(k -> {
            auditService.log("PIT_STOP", auth.getName(), "Logged pit stop for kart: " + k.getCode());
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reset-hours")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> resetHours(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        return service.find(id).map(k -> {
            k.setHoursRun(0);
            service.save(k);
            auditService.log("RESET_HOURS", auth.getName(), "Reset engine hours for kart: " + k.getCode());
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
