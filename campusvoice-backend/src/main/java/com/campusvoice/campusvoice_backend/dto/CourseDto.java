// src/main/java/com/campusvoice/campusvoice_backend/dto/CourseDto.java
package com.campusvoice.campusvoice_backend.dto;

import java.util.List;

public class CourseDto {
    private Long id;
    private String code;
    private String title;
    private String department;
    private Long teacherId;
    private String teacherName; // Optionnel : pour afficher le nom dans le frontend
    private List<String> allowedClasses;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public List<String> getAllowedClasses() { return allowedClasses; }
    public void setAllowedClasses(List<String> allowedClasses) { this.allowedClasses = allowedClasses; }
}