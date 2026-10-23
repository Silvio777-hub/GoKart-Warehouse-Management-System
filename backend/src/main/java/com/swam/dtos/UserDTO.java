package com.swam.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data Transfer Object for User accounts")
public class UserDTO {
    @Schema(description = "Unique database ID of the user", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Unique login name", example = "jsmith")
    private String username;

    @NotBlank(message = "Full name is required")
    @Schema(description = "User's full legal name", example = "John Smith")
    private String fullName;

    @NotBlank(message = "Role is required")
    @Schema(description = "System access role", example = "STAFF", allowableValues = { "ADMIN", "MANAGER", "STAFF" })
    private String role;

    @Schema(description = "User's password (write-only)", example = "secret123", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;

    @Schema(description = "Contact email address", example = "john.smith@example.com")
    private String email;

    @Schema(description = "Short user biography or notes", example = "Main mechanic since 2021")
    private String bio;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
