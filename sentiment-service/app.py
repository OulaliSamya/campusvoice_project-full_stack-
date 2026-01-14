# sentiment-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
from googletrans import Translator
import re
import time

app = Flask(__name__)
CORS(app)
translator = Translator()

# ✅ Mots non respectueux
PROFANE_WORDS = {
    "con", "connard", "connarde", "salope", "pute", "enculé", "enculee",
    "merde", "chier", "chiant", "nique", "ta race", "tg", "pd", "pédé",
    "sale", "ordure", "imbécile", "idiot", "crétin", "abruti", "débile",
    "bâtard", "fils de pute", "grosse", "moche", "vieux", "vieille",
    "conne", "trouduc", "minable", "nullard", "nullasse"
}

# ✅ Phrases neutres typiques
NEUTRAL_PHRASES = {
    "c'est ok", "cest ok", "c'est bon", "cest bon", "c'est correct",
    "cest correct", "pas mal", "moyen", "normal", "classique",
    "standard", "habituel", "ordinaire", "le cours est ok",
    "le cours est bon", "le cours est correct", "tout va bien"
}

def contains_profanity(text):
    """Détecte les mots non respectueux"""
    if not text:
        return False
    
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    words = set(clean.split())
    full_text = " ".join(words)
    
    for word in PROFANE_WORDS:
        if " " in word:
            if word in full_text:
                return True
        else:
            if word in words:
                return True
    return False

def is_neutral_phrase(text):
    """Détecte les phrases explicitement neutres"""
    clean = re.sub(r"[^\w]", " ", text.lower()).strip()
    return any(phrase in clean for phrase in NEUTRAL_PHRASES)

def safe_translate(text, retries=2):
    """Traduction avec gestion d'erreurs"""
    for i in range(retries):
        try:
            result = translator.translate(text, src='fr', dest='en')
            return result.text
        except Exception as e:
            print(f"Tentative {i+1} échouée: {e}")
            if i < retries - 1:
                time.sleep(1)
    return text

def analyze_sentiment_french(text):
    """Analyse robuste du sentiment"""
    if not text or len(text.strip()) < 3:
        return "NEUTRAL"
    
    if is_neutral_phrase(text):
        return "NEUTRAL"
    
    try:
        clean_text = re.sub(r"[^\w\s']", " ", text)
        if not clean_text.strip():
            return "NEUTRAL"
        
        english_text = safe_translate(clean_text)
        blob = TextBlob(english_text)
        polarity = blob.sentiment.polarity
        
        if polarity > 0.4:
            return "POSITIVE"
        elif polarity < -0.3:
            return "NEGATIVE"
        else:
            return "NEUTRAL"
            
    except Exception as e:
        print(f"Erreur analyse: {e}")
        return "NEUTRAL"

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if contains_profanity(text):
            return jsonify({
                "sentiment": "NEGATIVE",
                "profanity": True,
                "message": "Contenu inapproprié détecté"
            }), 400
        
        sentiment = analyze_sentiment_french(text)
        return jsonify({"sentiment": sentiment, "profanity": False})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)