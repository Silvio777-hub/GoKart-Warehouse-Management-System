package com.swam.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swam.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JwtUtil jwtUtil;

    @Autowired
    protected com.swam.repository.UserRepository userRepository;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        userRepository.deleteAll();

        com.swam.model.User admin = new com.swam.model.User();
        admin.setUsername("admin");
        admin.setFullName("Admin User");
        admin.setPassword("password");
        admin.setRole("ADMIN");
        admin.setDeleted(false);
        userRepository.save(admin);

        com.swam.model.User staff = new com.swam.model.User();
        staff.setUsername("staff");
        staff.setFullName("Staff User");
        staff.setPassword("password");
        staff.setRole("STAFF");
        staff.setDeleted(false);
        userRepository.save(staff);

        com.swam.model.User manager = new com.swam.model.User();
        manager.setUsername("manager");
        manager.setFullName("Manager User");
        manager.setPassword("password");
        manager.setRole("MANAGER");
        manager.setDeleted(false);
        userRepository.save(manager);
    }

    protected String getAdminToken() {
        return "Bearer " + jwtUtil.generateToken("admin", "ADMIN");
    }

    protected String getStaffToken() {
        return "Bearer " + jwtUtil.generateToken("staff", "STAFF");
    }

    protected String getManagerToken() {
        return "Bearer " + jwtUtil.generateToken("manager", "MANAGER");
    }
}
