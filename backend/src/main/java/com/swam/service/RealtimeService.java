package com.swam.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * RealtimeService - Central hub for WebSocket broadcasts.
 * This service ensures that any change in the system is instantly
 * communicated to all connected frontend clients.
 */
@Service
public class RealtimeService {
    private final SimpMessagingTemplate template;

    public RealtimeService(SimpMessagingTemplate template) {
        this.template = template;
    }

    /**
     * Broadcasts an update for a specific entity type.
     * 
     * @param entity  The type of entity (e.g., "karts", "parts", "users")
     * @param payload The data to send (usually the object itself or an ID)
     */
    public void broadcast(String entity, Object payload) {
        if (template != null) {
            template.convertAndSend("/topic/" + entity, payload);
        }
    }

    /** Helper for deletion events */
    public void broadcastDelete(String entity, Long id) {
        broadcast(entity, "DELETED:" + id);
    }
}
