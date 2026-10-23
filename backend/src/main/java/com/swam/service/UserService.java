package com.swam.service;

import com.swam.model.User;
import com.swam.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing User entities.
 * handles administrative tasks such as listing, creating, and deleting user
 * accounts.
 */
@Service
public class UserService {
    // Repository for user data persistence
    private final UserRepository repo;
    private final RealtimeService realtimeService;

    public UserService(UserRepository repo, RealtimeService realtimeService) {
        this.repo = repo;
        this.realtimeService = realtimeService;
    }

    /**
     * Retrieves all ACTIVE users in the system.
     * 
     * @return List of active User objects
     */
    public List<User> list() {
        return repo.findByDeletedFalse();
    }

    /**
     * Retrieves all DELETED users from the trash.
     * 
     * @return List of soft-deleted User objects
     */
    public List<User> listTrash() {
        return repo.findByDeletedTrue();
    }

    /**
     * Finds a user by their database identifier.
     * 
     * @param id The unique ID of the user
     * @return Optional containing the user if found
     */
    public Optional<User> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    /**
     * Finds a user by their username.
     * 
     * @param username The username to search for
     * @return User object or null
     */
    public User findByUsername(String username) {
        return repo.findByUsername(username);
    }

    /**
     * Finds a user by their registered email address.
     * 
     * @param email The email to search for
     * @return User object or null
     */
    public User findByEmail(String email) {
        return repo.findByEmail(email);
    }

    /**
     * Saves a new user or updates an existing one (e.g. for profile changes).
     * 
     * @param u The user entity to save
     * @return The saved User object
     */
    @Transactional
    public User save(User u) {
        if (u == null) {
            throw new IllegalArgumentException("User entity cannot be null");
        }
        // If it's a new user, check for unique username
        if (u.getId() == null && repo.findByUsername(u.getUsername()) != null) {
            throw new IllegalArgumentException("Username already exists: " + u.getUsername());
        }
        User saved = repo.save(u);
        realtimeService.broadcast("users", saved);
        return saved;
    }

    /**
     * Soft deletes a user by setting the deleted flag to true.
     * 
     * @param id The ID of the user to send to trash
     */
    @Transactional
    public void delete(Long id) {
        if (id == null) {
            return;
        }
        repo.findById(id).ifPresent(user -> {
            user.setDeleted(true);
            repo.save(user);
            realtimeService.broadcastDelete("users", id);
        });
    }

    /**
     * Restores a user from the trash by setting the deleted flag to false.
     * 
     * @param id The ID of the user to restore
     */
    @Transactional
    public void restore(Long id) {
        if (id == null) {
            return;
        }
        repo.findById(id).ifPresent(user -> {
            user.setDeleted(false);
            repo.save(user);
            realtimeService.broadcast("users", user);
        });
    }
}
