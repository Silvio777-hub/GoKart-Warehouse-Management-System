package com.swam.dtos;

import java.time.LocalDateTime;

public class DocumentDTO {
    private Long id;
    private String filename;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private long sizeBytes;

    // Constructors
    public DocumentDTO() {
    }

    public DocumentDTO(Long id, String filename, String uploadedBy, LocalDateTime uploadedAt, long sizeBytes) {
        this.id = id;
        this.filename = filename;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
        this.sizeBytes = sizeBytes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
