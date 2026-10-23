package com.swam.repository;

import com.swam.model.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
}
