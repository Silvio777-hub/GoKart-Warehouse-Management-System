package com.swam.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for Maintenance log entries")
public class MaintenanceDTO {
    @Schema(description = "Unique database ID of the maintenance log", example = "101", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotNull(message = "Kart ID is required")
    @Schema(description = "ID of the kart being maintained", example = "1")
    private Long kartId;

    @Schema(description = "Code of the kart (read-only)", example = "K-01", accessMode = Schema.AccessMode.READ_ONLY)
    private String kartCode;

    @NotBlank(message = "Description is required")
    @Schema(description = "Details of the maintenance work performed", example = "Oil change and brake pad replacement")
    private String description;

    @Schema(description = "Name or username of the person who performed the work", example = "jsmith")
    private String performedBy;

    @NotNull(message = "Performed at date is required")
    @Schema(description = "Timestamp of when the maintenance was finished", example = "2024-03-20T14:30:00")
    private LocalDateTime performedAt;

    @Schema(description = "Whether the work has been verified by a manager", example = "true")
    private boolean verified;

    @Schema(description = "High priority flag", example = "false")
    private boolean priority;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getKartId() {
        return kartId;
    }

    public void setKartId(Long kartId) {
        this.kartId = kartId;
    }

    public String getKartCode() {
        return kartCode;
    }

    public void setKartCode(String kartCode) {
        this.kartCode = kartCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public boolean isPriority() {
        return priority;
    }

    public void setPriority(boolean priority) {
        this.priority = priority;
    }
}
