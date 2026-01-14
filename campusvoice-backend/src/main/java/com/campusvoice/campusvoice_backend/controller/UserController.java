// src/main/java/com/campusvoice/campusvoice_backend/controller/UserController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.dto.UserResponse;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ Endpoint sécurisé : profil de l'utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        System.out.println(">>> Entrée dans /me");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Auth: " + auth);
        if (auth == null || !auth.isAuthenticated()) {
            System.out.println(">>> Non authentifié");
            return ResponseEntity.status(401).build();
        }
        String email = auth.getName();
        System.out.println("Email extrait: " + email);
        User user = userRepository.findByEmail(email).orElse(null);
        System.out.println("User trouvé: " + (user != null));
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(UserResponse.fromUser(user));
    }

    // ✅ Liste tous les utilisateurs (réservé aux admins en production)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Création d'utilisateur (optionnel – normalement géré par /api/auth/register)
    @PostMapping
    public User createUser(@RequestBody User user) {
        if ("ADMIN".equals(user.getRole().name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Création ADMIN interdite.");
        }
        return userRepository.save(user);
    }

    // ✅ Suppression d'utilisateur (réservée aux ADMIN via SecurityConfig)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}