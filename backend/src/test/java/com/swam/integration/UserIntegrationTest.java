package com.swam.integration;

import com.swam.dtos.UserDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class UserIntegrationTest extends BaseIntegrationTest {

    @Test
    public void testCreateUserForbiddenForStaff() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setUsername("newuser");
        dto.setFullName("New User");
        dto.setPassword("password123");
        dto.setRole("STAFF");

        mockMvc.perform(post("/api/users")
                .header("Authorization", getStaffToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCreateUserSuccessForAdmin() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setUsername("unique_user_" + System.currentTimeMillis());
        dto.setFullName("Admin Created User");
        dto.setPassword("password123");
        dto.setRole("STAFF");

        mockMvc.perform(post("/api/users")
                .header("Authorization", getAdminToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    public void testListUsersForbiddenForStaff() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", getStaffToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCreateUserValidationFail() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setUsername("a"); // Too short
        dto.setFullName(""); // Required
        dto.setRole("STAFF");

        mockMvc.perform(post("/api/users")
                .header("Authorization", getAdminToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testSoftDeleteUser() throws Exception {
        // Create user first
        com.swam.model.User user = new com.swam.model.User();
        user.setUsername("deleteme");
        user.setFullName("Delete Me");
        user.setPassword("password");
        user.setRole("STAFF");
        user.setDeleted(false);
        user = userRepository.save(user);
        Long id = user.getId();

        // Delete (Soft)
        mockMvc.perform(delete("/api/users/" + id)
                .header("Authorization", getAdminToken()))
                .andExpect(status().isNoContent());

        // Verify still in DB but marked as deleted
        mockMvc.perform(get("/api/users/trash")
                .header("Authorization", getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == 'deleteme')]").exists());
    }
}
