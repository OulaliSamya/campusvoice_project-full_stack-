package com.campusvoice.campusvoice_backend.auth;

import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;

public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private String department;
    private String studentId;

    public static AuthResponse fromUser(User user) {
        AuthResponse r = new AuthResponse();
        r.id = user.getId();
        r.fullName = user.getFullName();
        r.email = user.getEmail();
        r.role = user.getRole();
        r.department = user.getDepartment();
        r.studentId = user.getStudentId();
        return r;
    }

    public AuthResponse() {
    }

    // getters / setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
}
