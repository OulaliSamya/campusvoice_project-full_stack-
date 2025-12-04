package com.campusvoice.campusvoice_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_comments")
public class FeedbackComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Auteur du commentaire (prof ou admin)
    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    // Feedback lié
    @ManyToOne
    @JoinColumn(name = "feedback_id")
    private Feedback feedback;

    // Interne (visible seulement admin/prof) ou visible étudiant
    private boolean internal;

    public FeedbackComment() {}

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public Feedback getFeedback() { return feedback; }
    public void setFeedback(Feedback feedback) { this.feedback = feedback; }

    public boolean isInternal() { return internal; }
    public void setInternal(boolean internal) { this.internal = internal; }
}
