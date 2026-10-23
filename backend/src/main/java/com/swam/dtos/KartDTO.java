package com.swam.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for Go-Kart entities")
public class KartDTO {
    @Schema(description = "Unique database ID of the kart", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Kart code is required")
    @Size(max = 20, message = "Kart code must be at most 20 characters")
    @Schema(description = "Public identifier/code for the kart", example = "K-05")
    private String code;

    @NotBlank(message = "Status is required")
    @Schema(description = "Current operational status", example = "AVAILABLE", allowableValues = { "AVAILABLE",
            "UNDER_MAINTENANCE", "CRASHED", "RETIRED" })
    private String status;

    @Schema(description = "Additional context or notes regarding the status", example = "Needs tire alignment")
    private String statusNote;

    @NotNull(message = "Engine hours is required")
    @Min(value = 0, message = "Engine hours cannot be negative")
    @Schema(description = "Total engine runtime hours", example = "125")
    private Integer hoursRun;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getHoursRun() {
        return hoursRun;
    }

    public void setHoursRun(Integer hoursRun) {
        this.hoursRun = hoursRun;
    }

    public String getStatusNote() {
        return statusNote;
    }

    public void setStatusNote(String statusNote) {
        this.statusNote = statusNote;
    }
}
