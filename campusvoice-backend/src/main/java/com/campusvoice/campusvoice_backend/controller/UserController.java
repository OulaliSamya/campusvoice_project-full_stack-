package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lister tous les users (pour debug)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Créer un user (student / teacher / admin)
    @PostMapping
    public User createUser(@RequestBody User user) {
        // plus tard on hashera le password, pour l'instant on laisse simple
        return userRepository.save(user);
    }
}
