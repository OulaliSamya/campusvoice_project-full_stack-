package com.campusvoice.campusvoice_backend.dto;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        String department,
        String studentId,
        String classe,
        String role   // "STUDENT", "TEACHER" ou "ADMIN"
) {}
