package com.campusvoice.campusvoice_backend.config;

import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Vérifier si un ADMIN existe déjà
        boolean adminExists = userRepository.findAll()
                .stream()
                .anyMatch(u -> u.getRole() == UserRole.ADMIN);

        if (!adminExists) {
            User admin = new User();
            admin.setFullName("Administrateur CampusVoice");
            admin.setEmail("admin@campusvoice.com");
            admin.setPassword("admin123"); // pour le projet, simple
            admin.setDepartment("Direction");
            admin.setStudentId(null);
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("✅ Admin par défaut créé : admin@campusvoice.com / admin123");
        } else {
            System.out.println("ℹ️ Admin déjà présent, pas de création.");
        }
    }
}
