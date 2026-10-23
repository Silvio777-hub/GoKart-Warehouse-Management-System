package com.swam.rest;

import com.swam.model.Incident;
import com.swam.model.User;
import com.swam.service.UserService;
import com.swam.repository.IncidentRepository;
import com.swam.repository.KartRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Incidents", description = "Reporting and tracking of kart-related incidents and crashes")
public class IncidentREST {
    private final IncidentRepository repo;
    private final UserService userService;
    private final KartRepository kartRepo;
    private final com.swam.service.RealtimeService realtimeService;

    public IncidentREST(IncidentRepository repo, UserService userService, KartRepository kartRepo,
            com.swam.service.RealtimeService realtimeService) {
        this.repo = repo;
        this.userService = userService;
        this.kartRepo = kartRepo;
        this.realtimeService = realtimeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF')")
    @io.swagger.v3.oas.annotations.Operation(summary = "List all incidents", description = "Retrieves a history of reported incidents. Accessible by MANAGER and STAFF.")
    public List<Incident> list() {
        return repo.findAll();
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Report a new incident", description = "Records a new incident and links it to a kart if provided.")
    public ResponseEntity<Incident> report(@RequestBody Incident incident, Authentication auth) {
        User requester = userService.findByUsername(auth.getName());
        if (requester == null) {
            return ResponseEntity.status(401).build();
        }
        incident.setReportedBy(requester);
        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());
        if (incident.getKart() != null) {
            Long kartId = incident.getKart().getId();
            if (kartId != null) {
                kartRepo.findById(kartId).ifPresent(incident::setKart);
            }
        }
        Incident saved = repo.save(incident);
        realtimeService.broadcast("incidents", saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Incident> review(@PathVariable long id, @RequestBody Incident update, Authentication auth) {
        return repo.findById(id).map(existing -> {
            // Managers/Admins provide Action Plan and Close
            existing.setStatus(update.getStatus());
            existing.setCorrectiveAction(update.getCorrectiveAction());
            if (update.getSeverity() != null) {
                existing.setSeverity(update.getSeverity());
            }
            if ("CLOSED".equals(update.getStatus())) {
                existing.setClosedAt(LocalDateTime.now());
            }
            Incident saved = repo.save(existing);
            realtimeService.broadcast("incidents", saved);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Incident> resolve(@PathVariable long id, @RequestBody Incident update, Authentication auth) {
        return repo.findById(id).map(existing -> {
            // Admins provide final resolution
            existing.setResolution(update.getResolution());
            Incident saved = repo.save(existing);
            realtimeService.broadcast("incidents", saved);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
