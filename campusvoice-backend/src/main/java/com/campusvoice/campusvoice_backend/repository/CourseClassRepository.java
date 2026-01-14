// src/main/java/com/campusvoice/campusvoice_backend/repository/CourseClassRepository.java
package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseClassRepository extends JpaRepository<CourseClass, Long> {
    
    // ✅ Récupère les règles pour un cours donné
    List<CourseClass> findByCourseId(Long courseId);
    
    // ✅ Supprime une règle spécifique (cours + classe)
    void deleteByCourseIdAndClassName(Long courseId, String className);
}