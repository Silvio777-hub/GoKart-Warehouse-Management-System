package com.swam.security;

import com.swam.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import org.springframework.lang.NonNull;

/**
 * Filter that intercepts every request to check for a valid JWT in the
 * Authorization header.
 * If a valid token is present, it sets the authentication in the security
 * context.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Constructor for JwtFilter.
     * 
     * @param jwtUtil            Utility class for JWT operations
     * @param userDetailsService Service to load user details
     */
    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Core filter logic that checks the "Authorization" header.
     * Expects the format: "Bearer <token>"
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        // 1. Extract the Authorization header
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // 2. Validate header existence and format
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // 3. Verify token validity (signature and expiration)
            if (jwtUtil.isTokenValid(token)) {
                // 4. Extract username and load user details
                String username = jwtUtil.extractUsername(token);
                UserDetails ud = userDetailsService.loadUserByUsername(username);

                // 5. Create an authentication object and place it in the SecurityContext
                // This marks the user as "authenticated" for the rest of the request lifecycle
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(ud, null,
                        ud.getAuthorities());
                System.out
                        .println("DEBUG: Authenticated user " + username + " with authorities: " + ud.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("DEBUG: JWT token invalid for " + authHeader);
            }
        } else {
            // System.out.println("DEBUG: Missing or malformed Authorization header");
        }

        // 6. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
