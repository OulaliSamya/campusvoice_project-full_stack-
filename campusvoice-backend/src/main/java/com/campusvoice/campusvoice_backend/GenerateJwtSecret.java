// src/main/java/com/campusvoice/campusvoice_backend/GenerateJwtSecret.java
package com.campusvoice.campusvoice_backend;

import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class GenerateJwtSecret {
    public static void main(String[] args) {
        // Génère une clé 256 bits et encode en Base64 standard (pas URL)
        String secret = Base64.getEncoder().encodeToString(
            Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256).getEncoded()
        );
        System.out.println("✅ Clé Base64 standard (sans - ni _) :");
        System.out.println("app.jwt.secret=" + secret);
    }
}