// src/main/java/com/campusvoice/campusvoice_backend/service/SentimentAnalysisService.java
package com.campusvoice.campusvoice_backend.service;

import com.campusvoice.campusvoice_backend.model.Feedback;
import okhttp3.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SentimentAnalysisService {

    private static final String SENTIMENT_SERVICE_URL = "http://localhost:5000/analyze";
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Thèmes inchangés
    private static final java.util.Map<String, String> TOPIC_WORDS = java.util.Map.ofEntries(
        java.util.Map.entry("explication", "PEDAGOGY"),
        java.util.Map.entry("expliquer", "PEDAGOGY"),
        java.util.Map.entry("exemples", "PEDAGOGY"),
        java.util.Map.entry("exemple", "PEDAGOGY"),
        java.util.Map.entry("salle", "INFRA"),
        java.util.Map.entry("wifi", "INFRA"),
        java.util.Map.entry("projecteur", "INFRA"),
        java.util.Map.entry("tableau", "INFRA"),
        java.util.Map.entry("ordinateur", "INFRA"),
        java.util.Map.entry("horaire", "ORGANIZATION"),
        java.util.Map.entry("planning", "ORGANIZATION"),
        java.util.Map.entry("retard", "ORGANIZATION"),
        java.util.Map.entry("organisation", "ORGANIZATION"),
        java.util.Map.entry("examen", "EVALUATION"),
        java.util.Map.entry("controle", "EVALUATION"),
        java.util.Map.entry("note", "EVALUATION"),
        java.util.Map.entry("notation", "EVALUATION")
    );

    public Feedback.SentimentLabel detectSentiment(String content) {
        try {
            MediaType JSON = MediaType.get("application/json; charset=utf-8");
            String json = "{\"text\": \"" + escapeJson(content) + "\"}";
            RequestBody body = RequestBody.create(json, JSON);

            Request request = new Request.Builder()
                    .url(SENTIMENT_SERVICE_URL)
                    .post(body)
                    .build();

            Response response = client.newCall(request).execute();
            
            // ✅ Gestion des contenus inappropriés
            if (response.code() == 400) {
                String errorBody = response.body().string();
                System.out.println("Contenu inapproprié : " + errorBody);
                throw new RuntimeException("Contenu inapproprié détecté. Veuillez utiliser un langage respectueux.");
            }
            
            if (!response.isSuccessful()) {
                System.err.println("Erreur microservice: " + response.code());
                return Feedback.SentimentLabel.NEUTRAL;
            }

            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            String sentiment = root.get("sentiment").asText();

            switch (sentiment.toUpperCase()) {
                case "POSITIVE":
                    return Feedback.SentimentLabel.POSITIVE;
                case "NEGATIVE":
                    return Feedback.SentimentLabel.NEGATIVE;
                default:
                    return Feedback.SentimentLabel.NEUTRAL;
            }
        } catch (Exception e) {
            e.printStackTrace();
            // ✅ Si c'est un contenu inapproprié, lance une RuntimeException
            if (e.getMessage() != null && e.getMessage().contains("inapproprié")) {
                throw new RuntimeException("Contenu inapproprié détecté", e);
            }
            // ✅ Sinon, retourne NEUTRAL
            return Feedback.SentimentLabel.NEUTRAL;
        }
    }

    public String detectTopics(String content) {
        if (content == null) return null;
        String cleaned = content.toLowerCase().replaceAll("[^a-zàâçéèêëîïôûùüÿñæœ ]", " ");
        String[] words = cleaned.split("\\s+");
        java.util.Set<String> topics = new java.util.LinkedHashSet<>();

        for (String w : words) {
            String topic = TOPIC_WORDS.get(w);
            if (topic != null) {
                topics.add(topic);
            }
        }

        if (topics.isEmpty()) return null;
        return String.join(";", topics);
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    public int computeScore(String content) {
        return 0;
    }
}