package com.swam.dtos;

import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for Part acquisition requests")
public class PartRequestDTO {
    @Schema(description = "Unique database ID of the request", example = "201", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID of the spare part being requested", example = "501")
    private Long partId;

    @Schema(description = "Name of the requested part (read-only)", example = "Rear Tire Case", accessMode = Schema.AccessMode.READ_ONLY)
    private String partName;

    @Schema(description = "ID of the user who made the request", example = "5")
    private Long requesterId; // Optional, usually inferred from Auth

    @Schema(description = "Full name of the requester (read-only)", example = "John Smith", accessMode = Schema.AccessMode.READ_ONLY)
    private String requesterName;

    @Schema(description = "Number of units requested", example = "4")
    private int quantity;

    @Schema(description = "Current status of the request", example = "REQUESTED", allowableValues = { "REQUESTED",
            "APPROVED", "REJECTED", "COMPLETED" })
    private String status;

    @Schema(description = "Timestamp of when the request was created", example = "2024-03-20T11:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime requestedAt;

    // Getters/Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public String getPartName() {
        return partName;
    }

    public void setPartName(String partName) {
        this.partName = partName;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
}
