package com.swam.service;

import com.swam.model.User;
import com.swam.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Implementation of Spring Security's UserDetailsService.
 * This class is responsible for bridging our application's User model with
 * Spring Security's authentication subsystem.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository repo;

    /**
     * Constructor for UserDetailsServiceImpl.
     * 
     * @param repo Repository used to fetch user data from the database.
     */
    public UserDetailsServiceImpl(UserRepository repo) {
        this.repo = repo;
    }

    /**
     * Locates the user based on the username string.
     * In this implementation, we map our custom User entity to Spring's
     * UserDetails.
     * 
     * @param username the username identifying the user whose data is required.
     * @return UserDetails a fully populated user record (never null)
     * @throws UsernameNotFoundException if the user could not be found
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Fetch user from the database using the repository
        User u = repo.findByUsername(username);
        if (u == null || u.isDeleted()) {
            // Spring Security requires this exception if user is missing or inactive
            throw new UsernameNotFoundException("User not found or inactive: " + username);
        }

        // 2. Convert our internal role to a Spring Security GrantedAuthority.
        // We prefix with "ROLE_" to follow Spring Security's convention.
        GrantedAuthority ga = new SimpleGrantedAuthority("ROLE_" + u.getRole());

        // 3. Construct and return the standard UserDetails object provided by Spring.
        // This includes the hashed password which Spring will use for verification.
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(),
                u.getPassword(),
                Collections.singletonList(ga));
    }
}
