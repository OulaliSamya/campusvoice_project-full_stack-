// src/main/java/com/campusvoice/campusvoice_backend/repository/CourseRepository.java
package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.teacher")
    List<Course> findAllWithTeacher();

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.teacher")
    List<Course> findAll(); // Optionnel : si tu veux aussi un findAll() avec le teacher

    // ✅ Ajoute cette méthode pour charger les cours avec leurs classes
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.courseClasses")
    List<Course> findAllWithClasses();
}