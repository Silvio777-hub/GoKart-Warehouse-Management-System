package com.swam.integration;

import com.swam.dtos.KartDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class KartIntegrationTest extends BaseIntegrationTest {

    @Test
    public void testCreateKartForbiddenForStaff() throws Exception {
        KartDTO dto = new KartDTO();
        dto.setCode("K-TEST-INT");
        dto.setStatus("AVAILABLE");
        dto.setHoursRun(0);

        mockMvc.perform(post("/api/karts")
                .header("Authorization", getStaffToken())
                .contentType(java.util.Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(java.util.Objects.requireNonNull(objectMapper.writeValueAsString(dto))))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCreateKartValidationFails() throws Exception {
        KartDTO dto = new KartDTO();
        dto.setCode(""); // Invalid
        dto.setStatus(""); // Invalid
        dto.setHoursRun(-1); // Invalid

        mockMvc.perform(post("/api/karts")
                .header("Authorization", getAdminToken())
                .contentType(java.util.Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(java.util.Objects.requireNonNull(objectMapper.writeValueAsString(dto))))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetKartsAuthenticated() throws Exception {
        mockMvc.perform(get("/api/karts")
                .header("Authorization", getStaffToken()))
                .andExpect(status().isOk());
    }
}
