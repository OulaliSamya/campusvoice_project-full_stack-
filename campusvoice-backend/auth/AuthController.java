package com.campusvoice.campusvoice_backend.auth;

import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // frontend Angular
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // -------- LOGIN --------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> opt = userRepository.findByEmail(request.getEmail());

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        User user = opt.get();

        // Pour le projet : mot de passe en clair (OK pour TP, pas en production)
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        return ResponseEntity.ok(AuthResponse.fromUser(user));
    }

    // -------- REGISTER --------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // email déjà utilisé ?
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email déjà utilisé");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // en clair pour le moment
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment());
        user.setStudentId(request.getStudentId());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok(AuthResponse.fromUser(user));
    }
}
