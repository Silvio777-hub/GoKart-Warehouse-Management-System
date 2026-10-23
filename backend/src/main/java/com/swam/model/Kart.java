package com.swam.model;

import jakarta.persistence.*;

/**
 * Represents a Go-Kart in the fleet.
 */
@Entity
@Table(name = "karts")
public class Kart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., K-001

    @Column(nullable = false)
    private String status; // AVAILABLE, IN_USE, MAINTENANCE

    private int hoursRun;

    @Column(length = 1000)
    private String statusNote;

    // Getters and setters
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

    public int getHoursRun() {
        return hoursRun;
    }

    public void setHoursRun(int hoursRun) {
        this.hoursRun = hoursRun;
    }

    public String getStatusNote() {
        return statusNote;
    }

    public void setStatusNote(String statusNote) {
        this.statusNote = statusNote;
    }
}
