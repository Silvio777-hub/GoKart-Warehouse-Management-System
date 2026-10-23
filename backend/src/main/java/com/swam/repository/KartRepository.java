package com.swam.repository;

import com.swam.model.Kart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface KartRepository extends JpaRepository<Kart, Long> {
    @Query("SELECT k FROM Kart k WHERE LOWER(k.code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(k.status) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Kart> searchKarts(String query, Pageable pageable);
}
