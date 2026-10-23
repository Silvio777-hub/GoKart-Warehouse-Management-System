package com.swam.rest;

import com.swam.dtos.MaintenanceDTO;
import com.swam.mappers.MaintenanceMapper;
import com.swam.model.Maintenance;
import com.swam.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Endpoint for maintenance operations.
 */
@RestController
@RequestMapping("/api/maintenance")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Maintenance", description = "Operations for tracking kart repairs and maintenance history")
public class MaintenanceREST {
    private final MaintenanceService service;
    private final MaintenanceMapper mapper;

    public MaintenanceREST(MaintenanceService service, MaintenanceMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List all maintenance logs", description = "Retrieves a list of all maintenance events.")
    public List<MaintenanceDTO> list() {
        return service.list().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Create maintenance log", description = "Records a new maintenance event for a kart.")
    public ResponseEntity<MaintenanceDTO> create(@Valid @RequestBody MaintenanceDTO dto) {
        Maintenance entity = mapper.toEntity(dto);
        Maintenance saved = java.util.Objects.requireNonNull(service.save(entity));
        return ResponseEntity.created(java.util.Objects.requireNonNull(URI.create("/api/maintenance/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MaintenanceDTO> update(@PathVariable Long id, @Valid @RequestBody MaintenanceDTO dto,
            org.springframework.security.core.Authentication auth) {

        Maintenance entity = mapper.toEntity(dto);
        // Ensure ID matches
        entity.setId(id);
        Maintenance saved = java.util.Objects.requireNonNull(service.save(entity));
        return ResponseEntity.ok(mapper.toDTO(saved));
    }
}
