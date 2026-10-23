package com.swam.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class AnnouncementIntegrationTest extends BaseIntegrationTest {

        @Test
        public void testSetAndGetAnnouncement() throws Exception {
                String testMessage = "Test System Message " + System.currentTimeMillis();

                // Set
                mockMvc.perform(post("/api/admin/announcement")
                                .header("Authorization", getAdminToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("message", testMessage))))
                                .andExpect(status().isOk());

                // Get
                mockMvc.perform(get("/api/admin/announcement")
                                .header("Authorization", getAdminToken()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value(testMessage));
        }

        @Test
        public void testSetAnnouncementForbiddenForManager() throws Exception {
                mockMvc.perform(post("/api/admin/announcement")
                                .header("Authorization", getManagerToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("message", "Should fail"))))
                                .andExpect(status().isForbidden());
        }

        @Test
        public void testAnnouncementPersistenceLatest() throws Exception {
                String first = "First Message";
                String second = "Second Message";

                // Set first
                mockMvc.perform(post("/api/admin/announcement")
                                .header("Authorization", getAdminToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("message", first))))
                                .andExpect(status().isOk());

                // Set second
                mockMvc.perform(post("/api/admin/announcement")
                                .header("Authorization", getAdminToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("message", second))))
                                .andExpect(status().isOk());

                // Get - should be second
                mockMvc.perform(get("/api/admin/announcement")
                                .header("Authorization", getAdminToken()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value(second));
        }
}
