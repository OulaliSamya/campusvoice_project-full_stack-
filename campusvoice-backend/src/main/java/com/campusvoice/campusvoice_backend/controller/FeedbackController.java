package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.model.Course;
import com.campusvoice.campusvoice_backend.model.Feedback;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.CourseRepository;
import com.campusvoice.campusvoice_backend.repository.FeedbackRepository;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import com.campusvoice.campusvoice_backend.service.SentimentAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "http://localhost:4200")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final SentimentAnalysisService sentimentAnalysisService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public FeedbackController(FeedbackRepository feedbackRepository,
                              SentimentAnalysisService sentimentAnalysisService,
                              UserRepository userRepository,
                              CourseRepository courseRepository) {
        this.feedbackRepository = feedbackRepository;
        this.sentimentAnalysisService = sentimentAnalysisService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    // ----------- GET: liste de tous les feedbacks -----------
    @GetMapping
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    // ----------- POST: création d'un feedback -----------
    @PostMapping
    public Feedback createFeedback(@RequestBody FeedbackRequest request) {

        Feedback feedback = new Feedback();
        feedback.setContent(request.getContent());
        feedback.setCategory(request.getCategory());
        feedback.setAnonymous(request.isAnonymous());
        feedback.setCreatedAt(LocalDateTime.now());

        // Analyse de sentiments
        int score = sentimentAnalysisService.computeScore(request.getContent());
        Feedback.SentimentLabel label = sentimentAnalysisService.detectSentiment(request.getContent());
        String topics = sentimentAnalysisService.detectTopics(request.getContent());

        feedback.setSentimentScore(score);
        feedback.setSentimentLabel(label);
        feedback.setTopics(topics);

        // Lier à l'étudiant si fourni
        if (request.getStudentId() != null) {
            User student = userRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            feedback.setStudent(student);
        }

        // Lier au cours si fourni
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            feedback.setCourse(course);
        }

        return feedbackRepository.save(feedback);
    }

    // ---- DTO interne pour la requête ----
    public static class FeedbackRequest {
        private String content;
        private Feedback.Category category;
        private boolean anonymous;
        private Long studentId;
        private Long courseId;

        public FeedbackRequest() {}

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Feedback.Category getCategory() { return category; }
        public void setCategory(Feedback.Category category) { this.category = category; }

        public boolean isAnonymous() { return anonymous; }
        public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
    }
}
