package com.swam.repository;

import com.swam.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // We might want to list documents by user later, but fine for now
    List<Document> findAllByOrderByUploadedAtDesc();
}
