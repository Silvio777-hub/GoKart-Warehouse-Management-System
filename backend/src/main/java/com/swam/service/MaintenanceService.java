package com.swam.service;

import com.swam.model.Maintenance;
import com.swam.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing Maintenance logs.
 * Orchestrates the business logic for recording kart repairs and maintenance
 * history.
 */
@Service
public class MaintenanceService {
    // Repository for interacting with the maintenance table in the DB
    private final MaintenanceRepository repo;
    private final RealtimeService realtimeService;

    public MaintenanceService(MaintenanceRepository repo, RealtimeService realtimeService) {
        this.repo = repo;
        this.realtimeService = realtimeService;
    }

    /**
     * Retrieves all maintenance log entries.
     * 
     * @return List of Maintenance logs
     */
    public List<Maintenance> list() {
        return repo.findAll();
    }

    /**
     * Finds a specific maintenance entry by its ID.
     * 
     * @param id The log ID
     * @return Optional containing the log if found
     */
    public Optional<Maintenance> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    /**
     * Saves a new maintenance entry or updates an existing one.
     * 
     * @param m The maintenance entity to persist
     * @return The persisted Maintenance object
     */
    public Maintenance save(Maintenance m) {
        if (m == null) {
            throw new IllegalArgumentException("Maintenance entity cannot be null");
        }
        Maintenance saved = repo.save(m);
        realtimeService.broadcast("maintenance", saved);
        return saved;
    }

    /**
     * Deletes a maintenance log entry.
     * 
     * @param id The ID of the log to delete
     */
    public void delete(Long id) {
        if (id != null) {
            repo.deleteById(id);
            realtimeService.broadcastDelete("maintenance", id);
        }
    }
}
