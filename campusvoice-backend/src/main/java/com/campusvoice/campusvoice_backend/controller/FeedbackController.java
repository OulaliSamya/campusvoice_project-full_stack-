// src/main/java/com/campusvoice/campusvoice_backend/controller/FeedbackController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.model.Course;
import com.campusvoice.campusvoice_backend.model.Feedback;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.CourseRepository;
import com.campusvoice.campusvoice_backend.repository.FeedbackRepository;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import com.campusvoice.campusvoice_backend.service.SentimentAnalysisService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/feedbacks")
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

    // ----------- DELETE: suppression d'un feedback -----------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        // 1. Vérifier que le feedback existe
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback non trouvé"));

        // 2. Récupérer l'utilisateur connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 3. Vérifier les permissions
        boolean canDelete = false;
        
        // Admin peut tout supprimer
        if ("ADMIN".equals(currentUser.getRole().name())) {
            canDelete = true;
        }
        // Enseignant peut supprimer les feedbacks de ses cours
        else if ("TEACHER".equals(currentUser.getRole().name()) && feedback.getCourse() != null) {
            Course course = feedback.getCourse();
            if (course.getTeacher() != null && course.getTeacher().getId().equals(currentUser.getId())) {
                canDelete = true;
            }
        }
        // Étudiant peut supprimer ses propres feedbacks
        else if ("STUDENT".equals(currentUser.getRole().name()) && feedback.getStudent() != null) {
            if (feedback.getStudent().getId().equals(currentUser.getId())) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            return ResponseEntity.status(403).build();
        }

        feedbackRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ----------- PUT: modification d'un feedback (étudiant seulement) -----------
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody FeedbackUpdateRequest request) {
        // 1. Vérifier que le feedback existe
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback non trouvé"));

        // 2. Vérifier que c'est un étudiant qui modifie son propre feedback
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Seul l'étudiant auteur peut modifier
        if (!"STUDENT".equals(currentUser.getRole().name()) || 
            feedback.getStudent() == null || 
            !feedback.getStudent().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Mettre à jour le contenu
        feedback.setContent(request.getContent());
        feedback.setUpdatedAt(LocalDateTime.now());

        // Ré-analyser le sentiment
        int score = sentimentAnalysisService.computeScore(request.getContent());
        Feedback.SentimentLabel label = sentimentAnalysisService.detectSentiment(request.getContent());
        String topics = sentimentAnalysisService.detectTopics(request.getContent());

        feedback.setSentimentScore(score);
        feedback.setSentimentLabel(label);
        feedback.setTopics(topics);

        Feedback updated = feedbackRepository.save(feedback);
        return ResponseEntity.ok(updated);
    }

    // ---- DTO pour la création ----
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

    // ---- DTO pour la modification ----
    public static class FeedbackUpdateRequest {
        private String content;

        public FeedbackUpdateRequest() {}

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}