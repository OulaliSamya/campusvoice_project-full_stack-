package com.campusvoice.campusvoice_backend.auth;

import com.campusvoice.campusvoice_backend.model.UserRole;

public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String department;
    private String studentId;
    private UserRole role;

    public RegisterRequest() {
    }

    // getters / setters
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
