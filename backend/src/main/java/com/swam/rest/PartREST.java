package com.swam.rest;

import com.swam.dtos.PartDTO;
import com.swam.mappers.PartMapper;
import com.swam.model.Part;
import com.swam.service.PartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Endpoint for managing kart parts.
 * Uses PartDTO for external communication.
 */
@RestController
@RequestMapping("/api/parts")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Parts Inventory", description = "Management of kart parts and stock levels")
public class PartREST {
    private final PartService service;
    private final PartMapper mapper;

    public PartREST(PartService service, PartMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List all parts", description = "Retrieves the current inventory of all kart parts.")
    public List<PartDTO> list() {
        return service.list().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get part details", description = "Retrieves detailed information about a specific part.")
    public ResponseEntity<PartDTO> get(@PathVariable Long id) {
        return service.find(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PartDTO> create(@Valid @RequestBody PartDTO dto) {
        Part entity = mapper.toEntity(dto);
        Part saved = java.util.Objects.requireNonNull(service.save(entity));
        return ResponseEntity.created(java.util.Objects.requireNonNull(URI.create("/api/parts/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PartDTO> update(@PathVariable Long id, @Valid @RequestBody PartDTO dto) {
        return service.find(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setSku(dto.getSku());
            existing.setQuantity(dto.getQuantity());
            existing.setMinStock(dto.getMinStock());
            existing.setRestockFlag(dto.isRestockFlag());
            Part saved = java.util.Objects.requireNonNull(service.save(existing));
            return ResponseEntity.ok(mapper.toDTO(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
