package com.swam.rest;

import com.swam.dtos.PartRequestDTO;
import com.swam.mappers.PartRequestMapper;
import com.swam.model.PartRequest;
import com.swam.model.User;
import com.swam.service.PartRequestService;
import com.swam.service.UserService;
import com.swam.repository.PartRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/part-requests")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Part Requests", description = "Workflows for requesting and approving new kart parts")
public class PartRequestREST {
    private final PartRequestService service;
    private final PartRequestMapper mapper;
    private final UserService userService;
    private final PartRepository partRepo;

    public PartRequestREST(PartRequestService service, PartRequestMapper mapper, UserService userService,
            PartRepository partRepo) {
        this.service = service;
        this.mapper = mapper;
        this.userService = userService;
        this.partRepo = partRepo;
    }

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List all part requests", description = "Retrieves a history of submitted part requests.")
    public List<PartRequestDTO> list() {
        // Everyone can see requests for transparency? Or restrict? Let's allow all for
        // now.
        return service.list().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Submit part request", description = "Creates a new request for a kart part.")
    public ResponseEntity<PartRequestDTO> create(@Valid @RequestBody PartRequestDTO dto, Authentication auth) {
        PartRequest entity = mapper.toEntity(dto);
        User requester = userService.findByUsername(auth.getName());
        if (requester == null) {
            return ResponseEntity.status(401).build();
        }
        entity.setRequester(requester);
        entity.setStatus("REQUESTED"); // Default

        // Link part
        if (dto.getPartId() != null) {
            partRepo.findById(java.util.Objects.requireNonNull(dto.getPartId())).ifPresent(entity::setPart);
        }

        PartRequest saved = java.util.Objects.requireNonNull(service.save(entity));
        return ResponseEntity
                .created(java.util.Objects.requireNonNull(URI.create("/api/part-requests/" + saved.getId())))
                .body(mapper.toDTO(saved));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PartRequestDTO> updateStatus(@PathVariable Long id, @RequestBody PartRequestDTO dto) {

        return service.find(id).map(req -> {
            req.setStatus(dto.getStatus());
            // If approved, maybe deduct stock? Keep simple for now: just update status.
            PartRequest saved = service.save(req);
            return ResponseEntity.ok(mapper.toDTO(saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
