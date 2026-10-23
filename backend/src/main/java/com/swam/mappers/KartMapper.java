package com.swam.mappers;

import com.swam.dtos.KartDTO;
import com.swam.model.Kart;
import org.springframework.stereotype.Component;

@Component
public class KartMapper {
    public KartDTO toDTO(Kart kart) {
        if (kart == null)
            return null;
        KartDTO dto = new KartDTO();
        dto.setId(kart.getId());
        dto.setCode(kart.getCode());
        dto.setStatus(kart.getStatus());
        dto.setStatusNote(kart.getStatusNote());
        dto.setHoursRun(kart.getHoursRun());
        return dto;
    }

    public Kart toEntity(KartDTO dto) {
        if (dto == null)
            return null;
        Kart kart = new Kart();
        kart.setId(dto.getId());
        kart.setCode(dto.getCode());
        kart.setStatus(dto.getStatus());
        kart.setStatusNote(dto.getStatusNote());
        kart.setHoursRun(dto.getHoursRun());
        return kart;
    }
}
