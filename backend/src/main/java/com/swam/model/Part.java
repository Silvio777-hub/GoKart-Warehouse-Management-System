package com.swam.model;

import jakarta.persistence.*;

/**
 * Represents a spare part in inventory.
 */
@Entity
@Table(name = "parts")
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String sku;

    private int quantity;
    private int minStock;
    private boolean restockFlag = false;
    private java.time.LocalDateTime lastAudited;

    // Getters and setters
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
