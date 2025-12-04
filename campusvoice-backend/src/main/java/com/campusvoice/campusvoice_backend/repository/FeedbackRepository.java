package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.Feedback;
import com.campusvoice.campusvoice_backend.model.Feedback.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCategory(Category category);
}
