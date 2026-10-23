package com.swam.mappers;

import com.swam.dtos.PartRequestDTO;
import com.swam.model.PartRequest;

import org.springframework.stereotype.Component;

@Component
public class PartRequestMapper {
    public PartRequestMapper() {
    }

    public PartRequestDTO toDTO(PartRequest entity) {
        if (entity == null)
            return null;
        PartRequestDTO dto = new PartRequestDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setStatus(entity.getStatus());
        dto.setRequestedAt(entity.getRequestedAt());
        if (entity.getPart() != null) {
            dto.setPartId(entity.getPart().getId());
            dto.setPartName(entity.getPart().getName());
        }
        if (entity.getRequester() != null) {
            dto.setRequesterId(entity.getRequester().getId());
            dto.setRequesterName(entity.getRequester().getUsername());
        }
        return dto;
    }

    public PartRequest toEntity(PartRequestDTO dto) {
        if (dto == null)
            return null;
        PartRequest entity = new PartRequest();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setStatus(dto.getStatus());
        // Connections (part, requester) usually handled by Service to ensure
        // existence/security
        return entity;
    }
}
