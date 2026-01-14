// src/main/java/com/campusvoice/campusvoice_backend/config/WebConfig.java
package com.campusvoice.campusvoice_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Sert les fichiers uploadés depuis le dossier "uploads" à la racine du projet
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}