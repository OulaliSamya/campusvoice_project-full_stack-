// src/main/java/com/campusvoice/campusvoice_backend/controller/AdminController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.model.Feedback;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;
import com.campusvoice.campusvoice_backend.repository.FeedbackRepository;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import com.campusvoice.campusvoice_backend.repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final FeedbackRepository feedbackRepository;

    public AdminController(UserRepository userRepository, CourseRepository courseRepository, FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        long teachers = userRepository.countByRole(UserRole.TEACHER);
        long students = userRepository.countByRole(UserRole.STUDENT);
        long courses = courseRepository.count();
        long feedbacks = feedbackRepository.count();

        return ResponseEntity.ok(Map.of(
            "teachers", teachers,
            "students", students,
            "courses", courses,
            "totalFeedbacks", feedbacks
        ));
    }

    @GetMapping("/feedback-stats")
    public ResponseEntity<Map<String, Long>> getFeedbackCategoryStats() {
        var feedbacks = feedbackRepository.findAll();

        Map<String, Long> stats = feedbacks.stream()
            .collect(Collectors.groupingBy(
                f -> {
                    if (f.getSentimentLabel() == null) {
                        return "unknown";
                    }
                    return f.getSentimentLabel().name().toLowerCase();
                },
                Collectors.counting()
            ));

        return ResponseEntity.ok(Map.of(
            "positive", stats.getOrDefault("positive", 0L),
            "neutral", stats.getOrDefault("neutral", 0L),
            "negative", stats.getOrDefault("negative", 0L)
        ));
    }
}