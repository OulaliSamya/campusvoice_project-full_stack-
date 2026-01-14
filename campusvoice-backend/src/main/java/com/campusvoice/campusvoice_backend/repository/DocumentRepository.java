// src/main/java/com/campusvoice/campusvoice_backend/repository/DocumentRepository.java
package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // ✅ Importé

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCourseId(Long courseId);
    Optional<Document> findByFilename(String filename); // ✅ OK
}