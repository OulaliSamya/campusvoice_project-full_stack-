package com.campusvoice.campusvoice_backend.service;

import com.campusvoice.campusvoice_backend.model.Feedback;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SentimentAnalysisService {

    // Mots simples en français, tu pourras les améliorer
    private static final Set<String> POSITIVE_WORDS = Set.of(
            "bien", "excellent", "super", "clair", "claire", "utile",
            "intéressant", "interessant", "motivant", "parfait", "top"
    );

    private static final Set<String> NEGATIVE_WORDS = Set.of(
            "nul", "mauvais", "horrible", "incompréhensible", "incomprehensible",
            "fatigant", "fatiguant", "ennuyant", "chiant", "mediocre"
    );

    // Thèmes / topics
    private static final Map<String, String> TOPIC_WORDS = Map.ofEntries(
            Map.entry("explication", "PEDAGOGY"),
            Map.entry("expliquer", "PEDAGOGY"),
            Map.entry("exemples", "PEDAGOGY"),
            Map.entry("exemple", "PEDAGOGY"),

            Map.entry("salle", "INFRA"),
            Map.entry("wifi", "INFRA"),
            Map.entry("projecteur", "INFRA"),
            Map.entry("tableau", "INFRA"),
            Map.entry("ordinateur", "INFRA"),

            Map.entry("horaire", "ORGANIZATION"),
            Map.entry("planning", "ORGANIZATION"),
            Map.entry("retard", "ORGANIZATION"),
            Map.entry("organisation", "ORGANIZATION"),

            Map.entry("examen", "EVALUATION"),
            Map.entry("controle", "EVALUATION"),
            Map.entry("note", "EVALUATION"),
            Map.entry("notation", "EVALUATION")
    );

    // Nettoyage & découpage du texte
    private List<String> tokenize(String text) {
        if (text == null) return List.of();
        String cleaned = text
                .toLowerCase()
                .replaceAll("[^a-zàâçéèêëîïôûùüÿñæœ ]", " "); // remplace ponctuation par espace
        return Arrays.stream(cleaned.split("\\s+"))
                .filter(w -> !w.isEmpty())
                .toList();
    }

    public int computeScore(String content) {
        List<String> words = tokenize(content);
        int score = 0;
        for (String w : words) {
            if (POSITIVE_WORDS.contains(w)) score++;
            if (NEGATIVE_WORDS.contains(w)) score--;
        }
        return score;
    }

    public Feedback.SentimentLabel detectSentiment(String content) {
        int score = computeScore(content);
        if (score > 0) return Feedback.SentimentLabel.POSITIVE;
        if (score < 0) return Feedback.SentimentLabel.NEGATIVE;
        return Feedback.SentimentLabel.NEUTRAL;
    }

    public String detectTopics(String content) {
        List<String> words = tokenize(content);
        Set<String> topics = new LinkedHashSet<>();

        for (String w : words) {
            String topic = TOPIC_WORDS.get(w);
            if (topic != null) {
                topics.add(topic);
            }
        }

        if (topics.isEmpty()) {
            return null; // aucun topic détecté
        }
        // On renvoie une chaîne du style "PEDAGOGY;INFRA"
        return String.join(";", topics);
    }
}
