package com.swam.mappers;

import com.swam.dtos.PartDTO;
import com.swam.model.Part;
import org.springframework.stereotype.Component;

@Component
public class PartMapper {
    public PartDTO toDTO(Part entity) {
        if (entity == null)
            return null;
        PartDTO dto = new PartDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSku(entity.getSku());
        dto.setQuantity(entity.getQuantity());
        dto.setMinStock(entity.getMinStock());
        dto.setRestockFlag(entity.isRestockFlag());
        dto.setLastAudited(entity.getLastAudited());
        return dto;
    }

    public Part toEntity(PartDTO dto) {
        if (dto == null)
            return null;
        Part entity = new Part();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSku(dto.getSku());
        entity.setQuantity(dto.getQuantity());
        entity.setMinStock(dto.getMinStock());
        entity.setRestockFlag(dto.isRestockFlag());
        entity.setLastAudited(dto.getLastAudited());
        return entity;
    }
}
