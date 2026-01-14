// src/main/java/com/campusvoice/campusvoice_backend/model/CourseClass.java
package com.campusvoice.campusvoice_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "course_classes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "class_name"})
})
public class CourseClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "class_name", nullable = false) // ex: "L3 Informatique"
    private String className;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}