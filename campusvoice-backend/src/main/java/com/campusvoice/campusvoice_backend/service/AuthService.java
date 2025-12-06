package com.campusvoice.campusvoice_backend.service;

import com.campusvoice.campusvoice_backend.dto.LoginRequest;
import com.campusvoice.campusvoice_backend.dto.RegisterRequest;
import com.campusvoice.campusvoice_backend.dto.UserResponse;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse register(RegisterRequest request) {

        // 1) Interdire la création d'ADMIN via cette API
        if ("ADMIN".equalsIgnoreCase(request.role())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La création d'un compte ADMIN n'est pas autorisée via cette interface."
            );
        }

        // 2) Vérifier email unique
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email déjà utilisé"
            );
        });

        // 3) Créer l'utilisateur (STUDENT ou TEACHER)
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setDepartment(request.department());
        user.setStudentId(request.studentId());
        user.setRole(UserRole.valueOf(request.role())); // STUDENT / TEACHER
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public UserResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Email ou mot de passe incorrect"
                ));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Email ou mot de passe incorrect"
            );
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Compte inactif"
            );
        }

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getDepartment(),
                user.getStudentId(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
