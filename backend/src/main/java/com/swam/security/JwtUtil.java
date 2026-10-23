package com.swam.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility class for handling JSON Web Tokens (JWT).
 * Provides methods for generating, parsing, and validating tokens used for
 * authentication.
 */
@Component
public class JwtUtil {
    private final Key key;
    private final long expiration;

    public JwtUtil(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration}") long expiration) {
        // We use the configured secret string to create a secure key
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    /**
     * Generates a new JWT for a user.
     * 
     * @param username The subject of the token
     * @param role     The user's role, added as a custom claim
     * @return A signed, compact JWT string
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    /**
     * extracts the username (subject) from a given token.
     * 
     * @param token The JWT string
     * @return The username contained in the token
     */
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * checks if a token is valid and not expired.
     * 
     * @param token The JWT string
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token) {
        try {
            Claims c = getClaims(token);
            // Check if the expiration date is in the future
            return c.getExpiration().after(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            // Token has expired
            System.err.println("JWT token expired: " + ex.getMessage());
            return false;
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            // Token structure is invalid
            System.err.println("Malformed JWT token: " + ex.getMessage());
            return false;
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            // Signature verification failed
            System.err.println("JWT signature validation failed: " + ex.getMessage());
            return false;
        } catch (IllegalArgumentException ex) {
            // Token is null or empty
            System.err.println("JWT token is null or empty: " + ex.getMessage());
            return false;
        } catch (Exception ex) {
            // Catch any other unexpected exceptions
            System.err.println("Unexpected JWT validation error: " + ex.getMessage());
            return false;
        }
    }

    /**
     * Internal helper to parse the claims from a JWT string.
     * 
     * @param token The JWT string
     * @return The Claims object
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
