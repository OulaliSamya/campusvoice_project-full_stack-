// src/main/java/com/campusvoice/campusvoice_backend/exception/GlobalExceptionHandler.java
package com.campusvoice.campusvoice_backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        System.out.println("⚠️ Exception interceptée : " + e.getMessage());
        if (e.getMessage() != null && e.getMessage().contains("inapproprié")) {
            return ResponseEntity.status(400).body("Contenu inapproprié détecté. Veuillez utiliser un langage respectueux.");
        }
        return ResponseEntity.status(500).body("Erreur interne du serveur");
    }
}