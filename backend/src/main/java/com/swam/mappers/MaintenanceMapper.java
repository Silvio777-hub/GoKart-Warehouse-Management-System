package com.swam.mappers;

import com.swam.dtos.MaintenanceDTO;
import com.swam.model.Maintenance;
import com.swam.repository.KartRepository;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceMapper {
    private final KartRepository kartRepo;

    public MaintenanceMapper(KartRepository kartRepo) {
        this.kartRepo = kartRepo;
    }

    public MaintenanceDTO toDTO(Maintenance m) {
        if (m == null)
            return null;
        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setId(m.getId());
        dto.setKartId(m.getKart().getId());
        dto.setKartCode(m.getKart().getCode());
        dto.setDescription(m.getDescription());
        dto.setPerformedBy(m.getPerformedBy());
        dto.setPerformedAt(m.getPerformedAt());
        dto.setVerified(m.isVerified());
        dto.setPriority(m.isPriority());
        return dto;
    }

    public Maintenance toEntity(MaintenanceDTO dto) {
        if (dto == null)
            return null;
        Maintenance entity = new Maintenance();
        entity.setId(dto.getId());
        entity.setDescription(dto.getDescription());
        entity.setPerformedBy(dto.getPerformedBy());
        entity.setPerformedAt(dto.getPerformedAt());
        entity.setVerified(dto.isVerified());
        entity.setPriority(dto.isPriority());
        // Kart should be handled in service usually, but setting ID here if possible
        Long kartId = dto.getKartId();
        if (kartId != null) {
            kartRepo.findById(kartId).ifPresent(entity::setKart);
        }
        return entity;
    }
}
