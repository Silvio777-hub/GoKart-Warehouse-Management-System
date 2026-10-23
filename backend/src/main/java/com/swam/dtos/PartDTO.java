package com.swam.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for Spare Parts inventory items")
public class PartDTO {
    @Schema(description = "Unique database ID of the part", example = "501", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Part name is required")
    @Schema(description = "Display name of the part", example = "Rear Tire Case")
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must be at most 50 characters")
    @Schema(description = "Stock Keeping Unit / Serial number", example = "TIRE-R-01")
    private String sku;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Schema(description = "Current number of units in stock", example = "25")
    private int quantity;

    @Min(value = 0, message = "Minimum stock cannot be negative")
    @Schema(description = "Threshold for low stock warnings", example = "5")
    private int minStock;

    @Schema(description = "Flag indicating if a restock has been ordered", example = "false")
    private boolean restockFlag;

    @Schema(description = "Timestamp of the last inventory audit", example = "2024-03-20T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    private java.time.LocalDateTime lastAudited;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getMinStock() {
        return minStock;
    }

    public void setMinStock(int minStock) {
        this.minStock = minStock;
    }

    public boolean isRestockFlag() {
        return restockFlag;
    }

    public void setRestockFlag(boolean restockFlag) {
        this.restockFlag = restockFlag;
    }

    public java.time.LocalDateTime getLastAudited() {
        return lastAudited;
    }

    public void setLastAudited(java.time.LocalDateTime lastAudited) {
        this.lastAudited = lastAudited;
    }
}
