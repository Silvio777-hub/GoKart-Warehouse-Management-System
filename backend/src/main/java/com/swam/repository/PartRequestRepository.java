package com.swam.repository;

import com.swam.model.PartRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {
    List<PartRequest> findByStatus(String status);
}
