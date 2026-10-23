package com.swam.dtos;

import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for Staff work tasks")
public class TaskDTO {
    @Schema(description = "Unique database ID of the task", example = "301", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "Description of the work to be performed", example = "Inspect engine mounts on K-01")
    private String description;

    @Schema(description = "Username of the staff member assigned to this task", example = "staff_mechanic")
    private String assigneeUsername;

    @Schema(description = "Username of the manager who created the task (read-only)", example = "admin", accessMode = Schema.AccessMode.READ_ONLY)
    private String creatorUsername;

    @Schema(description = "Current completion status", example = "PENDING", allowableValues = { "PENDING",
            "IN_PROGRESS", "DONE", "CANCELLED" })
    private String status;

    @Schema(description = "Priority level of the task", example = "HIGH", allowableValues = { "LOW", "MEDIUM", "HIGH" })
    private String priority;

    @Schema(description = "Optional deadline for the task", example = "2024-03-25T17:00:00")
    private LocalDateTime dueDate;

    @Schema(description = "Timestamp of task creation", example = "2024-03-20T09:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssigneeUsername() {
        return assigneeUsername;
    }

    public void setAssigneeUsername(String assigneeUsername) {
        this.assigneeUsername = assigneeUsername;
    }

    public String getCreatorUsername() {
        return creatorUsername;
    }

    public void setCreatorUsername(String creatorUsername) {
        this.creatorUsername = creatorUsername;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
