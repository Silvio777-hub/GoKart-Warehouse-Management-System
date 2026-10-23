package com.swam.config;

import com.swam.model.Kart;
import com.swam.model.Part;
import com.swam.model.User;
import com.swam.repository.KartRepository;
import com.swam.repository.PartRepository;
import com.swam.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * DataLoader - Seeds the database with initial data when the application
 * starts.
 * This runs automatically after Spring Boot initializes.
 * It's useful for creating default users and test data for development.
 */
@Configuration
public class DataLoader {

    /**
     * CommandLineRunner is a Spring Boot interface that runs code after the app
     * starts.
     * We use it here to populate the database with default users, karts, and parts.
     */
    @Bean
    CommandLineRunner seed(UserRepository userRepo, KartRepository kartRepo, PartRepository partRepo,
            PasswordEncoder encoder) {
        return args -> {
            // 1. Create default admin user
            if (userRepo.findByUsername("admin") == null) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("password"));
                admin.setFullName("System Administrator");
                admin.setRole("ADMIN");
                admin.setEmail("admin@gokart.com");
                userRepo.save(admin);
            }

            // 2. Create default manager user
            if (userRepo.findByUsername("manager") == null) {
                User manager = new User();
                manager.setUsername("manager");
                manager.setPassword(encoder.encode("password"));
                manager.setFullName("Warehouse Manager");
                manager.setRole("MANAGER");
                manager.setEmail("manager@gokart.com");
                userRepo.save(manager);
            }

            // 3. Create default staff user (tech)
            if (userRepo.findByUsername("tech") == null) {
                User staff = new User();
                staff.setUsername("tech");
                staff.setPassword(encoder.encode("password"));
                staff.setFullName("Staff Member");
                staff.setRole("STAFF");
                staff.setEmail("tech@gokart.com");
                userRepo.save(staff);
            }

            // Create 6 sample karts if the database is empty
            // This gives us test data to work with
            if (kartRepo.findAll().isEmpty()) {
                for (int i = 1; i <= 6; i++) {
                    Kart k = new Kart();
                    // String.format creates codes like "K-001", "K-002", etc.
                    k.setCode(String.format("K-%03d", i));
                    k.setStatus("AVAILABLE");
                    k.setHoursRun(0);
                    kartRepo.save(k);
                }
            }

            // Create one sample part for testing inventory features
            if (partRepo.findAll().isEmpty()) {
                createPart(partRepo, "Brake Fluid (DOT 4)", "FL-001", 15, 5);
                createPart(partRepo, "Engine Oil (Synth)", "FL-002", 20, 5);
                createPart(partRepo, "Spark Plug (Standard)", "SP-001", 50, 10);
                createPart(partRepo, "Rear Tire (Slick)", "TR-001", 12, 4);
                createPart(partRepo, "Front Tire (Slick)", "TR-002", 12, 4);
                createPart(partRepo, "Rear Tire (Wet)", "TR-003", 8, 4);
                createPart(partRepo, "Front Tire (Wet)", "TR-004", 8, 4);
                createPart(partRepo, "Drive Chain (428)", "CH-001", 10, 3);
                createPart(partRepo, "Air Filter", "AF-001", 15, 5);
                createPart(partRepo, "Fuel Filter", "FF-001", 20, 5);
                createPart(partRepo, "Brake Pad Set", "BP-001", 25, 8);
                createPart(partRepo, "Axle Bearing", "AB-001", 6, 2);
                createPart(partRepo, "Steering Tie Rod", "ST-001", 4, 1);
            }
        };
    }

    private void createPart(PartRepository repo, String name, String sku, int qty, int min) {
        Part p = new Part();
        p.setName(name);
        p.setSku(sku);
        p.setQuantity(qty);
        p.setMinStock(min);
        repo.save(p);
    }
}
