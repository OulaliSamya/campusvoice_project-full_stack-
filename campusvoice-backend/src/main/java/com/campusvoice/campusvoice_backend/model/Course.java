package com.campusvoice.campusvoice_backend.model;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;      // ex: M2I-DS-01

    @Column(nullable = false)
    private String title;     // ex: Apprentissage automatique

    private String department;

    // Prof responsable du cours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    @JsonIgnore
    private User teacher;

    // ✅ Relation avec CourseClass
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Empêche la boucle infinie
    private List<CourseClass> courseClasses = new ArrayList<>();

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public List<CourseClass> getCourseClasses() { return courseClasses; }
    public void setCourseClasses(List<CourseClass> courseClasses) { this.courseClasses = courseClasses; }

    // ✅ Méthode pour exposer allowedClasses dans le JSON
    @Transient
    public List<String> getAllowedClasses() {
        return courseClasses.stream()
                .map(CourseClass::getClassName)
                .collect(Collectors.toList());
    }
}
