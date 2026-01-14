// src/main/java/com/campusvoice/campusvoice_backend/dto/UserResponse.java
package com.campusvoice.campusvoice_backend.dto;
import com.campusvoice.campusvoice_backend.model.User;

import com.campusvoice.campusvoice_backend.model.UserRole;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String department,
        String studentId,
        String classe,        // ✅ Ajouté
        UserRole role,
        boolean active,
        LocalDateTime createdAt
) {
    public static UserResponse fromUser(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getDepartment(),
                user.getStudentId(),
                user.getClasse(), // ✅
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}