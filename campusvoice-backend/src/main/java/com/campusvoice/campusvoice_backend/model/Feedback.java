package com.campusvoice.campusvoice_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    public enum Category {
        COURSE,
        TEACHER,
        INFRA,
        OTHER
    }

    public enum SentimentLabel {
        POSITIVE,
        NEGATIVE,
        NEUTRAL
    }

    public enum Status {
        NEW,
        IN_REVIEW,
        RESOLVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    private boolean isAnonymous;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private SentimentLabel sentimentLabel;

    private int sentimentScore;           // -5 .. +5 par ex

    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    // Exemple: "PEDAGOGY;INFRA"
    private String topics;

    // Étudiant qui a envoyé le feedback
    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    // Cours concerné (optionnel)
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    public Feedback() {}

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public SentimentLabel getSentimentLabel() { return sentimentLabel; }
    public void setSentimentLabel(SentimentLabel sentimentLabel) { this.sentimentLabel = sentimentLabel; }

    public int getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(int sentimentScore) { this.sentimentScore = sentimentScore; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTopics() { return topics; }
    public void setTopics(String topics) { this.topics = topics; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
