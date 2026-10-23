package com.swam.rest;

import com.swam.model.MaintenanceSchedule;
import com.swam.repository.MaintenanceScheduleRepository;
import com.swam.repository.KartRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance-schedules")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Maintenance Schedules", description = "Planning and tracking of recurring kart maintenance intervals")
public class MaintenanceScheduleREST {
    private final MaintenanceScheduleRepository repo;
    private final KartRepository kartRepo;
    private final com.swam.service.RealtimeService realtimeService;

    public MaintenanceScheduleREST(MaintenanceScheduleRepository repo, KartRepository kartRepo,
            com.swam.service.RealtimeService realtimeService) {
        this.repo = repo;
        this.kartRepo = kartRepo;
        this.realtimeService = realtimeService;
    }

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "List all maintenance schedules", description = "Retrieves all planned maintenance routines.")
    public List<MaintenanceSchedule> list() {
        return repo.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create maintenance schedule", description = "Creates a new recurring maintenance plan for a kart.")
    public ResponseEntity<MaintenanceSchedule> create(@RequestBody MaintenanceSchedule schedule, Authentication auth) {

        if (schedule.getKart() != null) {
            Long kartId = schedule.getKart().getId();
            if (kartId != null) {
                kartRepo.findById(kartId).ifPresent(schedule::setKart);
            }
        }

        // Calculate next due if not set
        if (schedule.getNextDue() == null) {
            schedule.setNextDue(LocalDateTime.now().plusDays(schedule.getIntervalDays()));
        }

        MaintenanceSchedule saved = repo.save(schedule);
        realtimeService.broadcast("maintenance-schedules", saved);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        repo.deleteById(id);
        realtimeService.broadcastDelete("maintenance-schedules", id);
        return ResponseEntity.noContent().build();
    }
}
