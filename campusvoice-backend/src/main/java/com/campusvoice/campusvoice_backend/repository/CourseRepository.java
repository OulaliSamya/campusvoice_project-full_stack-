package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
