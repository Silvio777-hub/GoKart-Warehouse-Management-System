package com.swam.service;

import com.swam.model.Part;
import com.swam.repository.PartRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing Spare Parts inventory.
 * Handles stock levels and part identification records.
 */
@Service
public class PartService {
    // Repository that performs DB operations for Part entities
    private final PartRepository repo;
    private final EmailService emailService;
    private final RealtimeService realtimeService;

    public PartService(PartRepository repo, EmailService emailService, RealtimeService realtimeService) {
        this.repo = repo;
        this.emailService = emailService;
        this.realtimeService = realtimeService;
    }

    /**
     * Lists all spare parts currently in the database.
     * 
     * @return List of Part objects
     */
    public List<Part> list() {
        return repo.findAll();
    }

    /**
     * Finds a part by its unique database ID.
     * 
     * @param id The ID to search for
     * @return Optional containing the part if it exists
     */
    public Optional<Part> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    /**
     * Saves a new part or updates an existing one.
     * 
     * @param p The part entity to persist
     * @return The persisted Part object
     */
    public Part save(Part p) {
        if (p == null) {
            throw new IllegalArgumentException("Part entity cannot be null");
        }

        // Save the part first
        Part saved = repo.save(p);

        // Check if we hit or crossed the threshold
        if (saved.getQuantity() <= saved.getMinStock()) {
            emailService.sendLowStockAlert(saved.getName(), saved.getQuantity(), saved.getMinStock());
        }

        realtimeService.broadcast("parts", saved);
        return saved;
    }

    /**
     * Removes a part record from the database.
     * 
     * @param id The ID of the part to remove
     */
    public void delete(Long id) {
        if (id != null) {
            repo.deleteById(id);
            realtimeService.broadcastDelete("parts", id);
        }
    }
}
