package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.FeedbackComment;
import com.campusvoice.campusvoice_backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackCommentRepository extends JpaRepository<FeedbackComment, Long> {
    List<FeedbackComment> findByFeedback(Feedback feedback);
}
