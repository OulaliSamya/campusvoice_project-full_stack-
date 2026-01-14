// src/main/java/com/campusvoice/campusvoice_backend/service/AuthService.java
package com.campusvoice.campusvoice_backend.service;

import com.campusvoice.campusvoice_backend.config.JwtUtil;
import com.campusvoice.campusvoice_backend.dto.LoginRequest;
import com.campusvoice.campusvoice_backend.dto.RegisterRequest;
import com.campusvoice.campusvoice_backend.dto.UserResponse;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(RegisterRequest request) {
        System.out.println(">>> Début de l'inscription : " + request.email());

        if ("ADMIN".equalsIgnoreCase(request.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Création ADMIN interdite.");
        }

        System.out.println(">>> Vérification email...");
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email déjà utilisé");
        });

        System.out.println(">>> Création de l'utilisateur...");
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setDepartment(request.department());
        user.setStudentId(request.studentId());
        user.setClasse(request.classe()); // ✅
        user.setRole(UserRole.valueOf(request.role()));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        System.out.println(">>> Sauvegarde en cours...");
        User saved = userRepository.save(user);
        System.out.println(">>> Utilisateur sauvegardé : " + saved.getId());

        return mapToResponse(saved);
    }
 
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Compte inactif");
        }

        // Créer UserDetails pour JWT
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );

        return jwtUtil.generateToken(userDetails);
    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
    }

    private UserResponse mapToResponse(User user) {
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