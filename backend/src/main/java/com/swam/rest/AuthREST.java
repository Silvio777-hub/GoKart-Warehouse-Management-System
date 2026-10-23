package com.swam.rest;

import com.swam.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthREST - The controller that handles user logging in.
 * This is the entry point for authentication requests.
 */
@RestController
@RequestMapping("/api/auth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Authentication", description = "Login, token management, and password reset")
public class AuthREST {
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final com.swam.service.PasswordResetService resetService;

    // Constructor injection is better for testing than @Autowired
    public AuthREST(AuthenticationManager authManager, JwtUtil jwtUtil,
            com.swam.service.PasswordResetService resetService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.resetService = resetService;
    }

    @GetMapping("/health")
    @io.swagger.v3.oas.annotations.Operation(summary = "Health check", description = "Simple endpoint to verify if the auth service is reachable.")
    public org.springframework.http.ResponseEntity<Map<String, String>> health() {
        return org.springframework.http.ResponseEntity.ok(Map.of("status", "UP"));
    }

    /**
     * Endpoint for user login.
     * 1. Receives username and password
     * 2. Authenticates against the database
     * 3. Generates a JWT token if successful
     */
    @PostMapping("/login")
    @io.swagger.v3.oas.annotations.Operation(summary = "User login", description = "Authenticates user credentials and returns a JWT token.")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        try {
            // This line checks the username and password against the database
            // It will throw an exception if authentication fails
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.get("username"), req.get("password")));

            // Extract the user's role (e.g. ADMIN, MANAGER) to put inside the token
            // We remove the "ROLE_" prefix because the frontend expects just "ADMIN"
            String role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("STAFF"); // Default to STAFF if something goes wrong

            // Generate the token and send it back to the user
            // The user will save this token in their browser and send it with future
            // requests
            String token = jwtUtil.generateToken(auth.getName(), role);
            return org.springframework.http.ResponseEntity.ok(Map.of("token", token));
        } catch (org.springframework.security.core.AuthenticationException e) {
            // Return 401 for bad credentials
            return org.springframework.http.ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> req) {
        resetService.createTokenAndSendEmail(req.get("email"));
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        String password = req.get("password");

        if (token == null || password == null || password.length() < 6) {
            return org.springframework.http.ResponseEntity.badRequest()
                    .body(Map.of("message", "Token is required and password must be at least 6 characters."));
        }

        boolean success = resetService.resetPassword(token, password);
        if (success) {
            return org.springframework.http.ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } else {
            return org.springframework.http.ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired password reset token."));
        }
    }
}
