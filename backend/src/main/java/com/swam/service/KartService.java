package com.swam.service;

import com.swam.model.Kart;
import com.swam.repository.KartRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for managing Go-Karts.
 * Handles CRUD operations for the kart fleet.
 */
@Service
public class KartService {
    // Repository that performs DB operations for Kart entities
    private final KartRepository repo;
    private final RealtimeService realtimeService;

    public KartService(KartRepository repo, RealtimeService realtimeService) {
        this.repo = repo;
        this.realtimeService = realtimeService;
    }

    /**
     * Lists karts with pagination and optional search query.
     */
    public Page<Kart> list(Pageable pageable, String query) {
        if (pageable == null) {
            return Page.empty();
        }
        if (query != null && !query.isEmpty()) {
            return repo.searchKarts(query, pageable);
        }
        return repo.findAll(pageable);
    }

    /**
     * Lists all karts (for internal/admin use).
     */
    public java.util.List<Kart> list() {
        return repo.findAll();
    }

    /**
     * Finds a specific kart by ID.
     * 
     * @param id the kart ID
     * @return Optional containing the kart if found
     */
    public Optional<Kart> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    /**
     * Saves or updates a kart.
     * 
     * @param k the kart entity to save
     * @return the saved kart
     */
    public Kart save(Kart k) {
        if (k == null) {
            throw new IllegalArgumentException("Kart entity cannot be null");
        }
        Kart saved = repo.save(k);
        // Broadcast update to all connected clients
        realtimeService.broadcast("karts", saved);
        return saved;
    }

    /**
     * Deletes a kart by ID.
     * 
     * @param id the kart ID to delete
     */
    public void delete(Long id) {
        if (id != null) {
            repo.deleteById(id);
            // Broadcast deletion event
            realtimeService.broadcastDelete("karts", id);
        }
    }
}
