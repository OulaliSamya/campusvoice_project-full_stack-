package com.campusvoice.campusvoice_backend.dto;

import com.campusvoice.campusvoice_backend.model.UserRole;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String department,
        String studentId,
        UserRole role,
        boolean active,
        LocalDateTime createdAt
) {}
