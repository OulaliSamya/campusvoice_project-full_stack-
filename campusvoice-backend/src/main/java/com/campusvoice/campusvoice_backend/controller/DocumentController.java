// src/main/java/com/campusvoice/campusvoice_backend/controller/DocumentController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.model.Course;
import com.campusvoice.campusvoice_backend.model.Document;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.CourseRepository;
import com.campusvoice.campusvoice_backend.repository.DocumentRepository;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    public DocumentController(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    // ✅ Upload : réservé aux enseignants
    @PostMapping
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "courseId", required = false) Long courseId) {

        // 1. Vérifier que l'utilisateur est connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = auth.getName();

        // 2. Trouver l'utilisateur
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 3. Vérifier que c'est un enseignant
        if (!"TEACHER".equals(teacher.getRole().name())) {
            return ResponseEntity.status(403).build();
        }

        // 4. Créer le dossier uploads si absent
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload", e);
        }

        // 5. Générer un nom de fichier UNIQUE
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "document.pdf";
        }
        String safeFilename = System.currentTimeMillis() + "_" + originalFilename.replace(" ", "_");

        // 6. Vérifier si le fichier existe déjà
        if (documentRepository.findByFilename(safeFilename).isPresent()) {
            return ResponseEntity.status(409).build(); // Conflit
        }

        Path filePath = Paths.get(uploadDir).resolve(safeFilename);

        // 7. Sauvegarder le fichier sur disque
        try {
            file.transferTo(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Échec de l'upload du fichier", e);
        }

        // 8. Créer l'entité Document
        Document document = new Document();
        document.setTitle(title);
        document.setFilename(safeFilename); // ✅ Nom unique stocké en base
        document.setFileType(file.getContentType());
        document.setUploadPath(filePath.toString());
        document.setTeacher(teacher);
        document.setCreatedAt(LocalDateTime.now());

        // 9. Lier au cours si spécifié
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
            document.setCourse(course);
        }

        Document saved = documentRepository.save(document);
        return ResponseEntity.ok(saved);
    }

    // ✅ Liste les documents : accessible à tous (étudiants et enseignants)
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments(@RequestParam(required = false) Long courseId) {
        if (courseId != null) {
            return ResponseEntity.ok(documentRepository.findByCourseId(courseId));
        }
        return ResponseEntity.ok(documentRepository.findAll());
    }

    // ✅ Vérifie si un document existe : accessible à tous
    @GetMapping("/exists/{fileName:.+}")
    public ResponseEntity<Boolean> documentExists(@PathVariable String fileName) {
        boolean exists = documentRepository.findByFilename(fileName).isPresent();
        return ResponseEntity.ok(exists);
    }

    // ✅ Téléchargement : accessible à tous
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String fileName) {
        Document document = documentRepository.findByFilename(fileName)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        Path filePath = Paths.get(document.getUploadPath());
        Resource resource = new FileSystemResource(filePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFilename() + "\"")
                .body(resource);
    }

    // ✅ Suppression : réservée aux enseignants
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        // 1. Vérifier que l'utilisateur est connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = auth.getName();

        // 2. Trouver l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 3. Vérifier que c'est un enseignant
        if (!"TEACHER".equals(user.getRole().name())) {
            return ResponseEntity.status(403).build();
        }

        // 4. Supprimer le document
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}