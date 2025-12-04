package com.campusvoice.campusvoice_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    public enum Type {
        FEEDBACK_STATUS_CHANGED,
        NEW_COMMENT,
        OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Destinataire
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    // ⚠️ colonne renommée pour éviter le mot réservé "read"
    @Column(name = "is_read")
    private boolean read = false;

    @Enumerated(EnumType.STRING)
    private Type type = Type.OTHER;

    // Optionnel: feedback lié
    private Long feedbackId;

    public Notification() {}

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public Long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }
}
