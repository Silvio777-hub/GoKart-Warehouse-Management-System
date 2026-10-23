package com.swam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_schedule")
public class MaintenanceSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Kart kart;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private int intervalDays; // e.g., 30 for monthly

    private LocalDateTime lastPerformed;
    private LocalDateTime nextDue;

    private boolean active = true;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Kart getKart() {
        return kart;
    }

    public void setKart(Kart kart) {
        this.kart = kart;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getIntervalDays() {
        return intervalDays;
    }

    public void setIntervalDays(int intervalDays) {
        this.intervalDays = intervalDays;
    }

    public LocalDateTime getLastPerformed() {
        return lastPerformed;
    }

    public void setLastPerformed(LocalDateTime lastPerformed) {
        this.lastPerformed = lastPerformed;
    }

    public LocalDateTime getNextDue() {
        return nextDue;
    }

    public void setNextDue(LocalDateTime nextDue) {
        this.nextDue = nextDue;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
