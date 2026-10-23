package com.swam.service;

import com.swam.model.PartRequest;
import com.swam.repository.PartRequestRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PartRequestService {
    private final PartRequestRepository repo;
    private final PartService partService;
    private final AuditService auditService;
    private final RealtimeService realtimeService;

    public PartRequestService(PartRequestRepository repo, PartService partService, AuditService auditService,
            RealtimeService realtimeService) {
        this.repo = repo;
        this.partService = partService;
        this.auditService = auditService;
        this.realtimeService = realtimeService;
    }

    public List<PartRequest> list() {
        return repo.findAll();
    }

    public Optional<PartRequest> find(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repo.findById(id);
    }

    /**
     * Saves a part request.
     * If the status is being updated to APPROVED, it automatically deducts the
     * requested
     * quantity from the corresponding part's inventory.
     */
    public PartRequest save(PartRequest pr) {
        if (pr == null) {
            throw new IllegalArgumentException("PartRequest entity cannot be null");
        }

        // Check if this is an approval for a previously non-approved request
        if ("APPROVED".equals(pr.getStatus()) && pr.getPart() != null) {
            boolean alreadyApproved = false;
            Long requestId = pr.getId();
            if (requestId != null) {
                alreadyApproved = repo.findById(requestId)
                        .map(existing -> "APPROVED".equals(existing.getStatus()))
                        .orElse(false);
            }

            if (!alreadyApproved) {
                com.swam.model.Part part = pr.getPart();
                if (part.getQuantity() < pr.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for part: " + part.getName());
                }

                int oldQty = part.getQuantity();
                int newQty = oldQty - pr.getQuantity();
                part.setQuantity(newQty);
                partService.save(part);

                String user = (pr.getRequester() != null) ? pr.getRequester().getUsername() : "System";
                auditService.log("INVENTORY_DEDUCTION", user,
                        "Deducted " + pr.getQuantity() + " units of " + part.getName() + " (Approval). Remaining: "
                                + newQty);
            }
        }

        PartRequest saved = repo.save(pr);
        realtimeService.broadcast("part-requests", saved);
        return saved;
    }
}
