package com.swam.service;

import com.swam.model.AuditLog;
import com.swam.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {
    private final AuditLogRepository repo;
    private final RealtimeService realtimeService;

    public AuditService(AuditLogRepository repo, RealtimeService realtimeService) {
        this.repo = repo;
        this.realtimeService = realtimeService;
    }

    @Transactional
    public void log(String action, String username, String details) {
        AuditLog saved = repo.save(new AuditLog(action, username, details));
        realtimeService.broadcast("audit", saved);
    }

    public List<AuditLog> listRecent() {
        return repo.findTop50ByOrderByTimestampDesc();
    }
}
