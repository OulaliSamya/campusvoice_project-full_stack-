// src/main/java/com/campusvoice/campusvoice_backend/model/Document.java
package com.campusvoice.campusvoice_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // ✅ Ajouté
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @JsonProperty("fileName")
    private String filename;

    private String fileType;

    private String uploadPath;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonIgnore // ✅ Empêche la sérialisation du proxy Hibernate
    private User teacher;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonProperty("courseId")
    private Course course;

    @Column(name = "created_at")
    @JsonProperty("uploadDate")
    private LocalDateTime createdAt;

    // Getters & Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getUploadPath() { return uploadPath; }
    public void setUploadPath(String uploadPath) { this.uploadPath = uploadPath; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}