package com.swam.repository;

import com.swam.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Optional<Announcement> findFirstByOrderByIdDesc();
}
