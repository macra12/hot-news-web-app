"""
Lightweight, transparent content classifier for news articles.

This is a keyword/heuristic model (interpretable, instant, no training data or
extra dependencies) — NOT a deep-learning model. It gives the admin dashboard:

  • content TYPE   — what the story is about (crime, conflict, politics, …)
  • SENSITIVITY    — how sensitive/graphic the content is (none / medium / high)

It can later be swapped for a trained ML classifier (e.g. scikit-learn TF-IDF +
Naive Bayes) without changing the callers — the public API is just classify().
"""
import re

# Content-type signals → weighted keyword lists.
TYPE_KEYWORDS = {
    "crime":         ["arrest", "scam", "fraud", "drug", "trafficking", "smuggling", "theft",
                      "robbery", "gang", "jailed", "convicted", "police", "court", "murder"],
    "conflict":      ["war", "attack", "military", "troops", "missile", "strike", "border",
                      "clash", "conflict", "ceasefire", "invasion", "rebel"],
    "politics":      ["government", "minister", "election", "parliament", "senate", "president",
                      "prime minister", "policy", "vote", "diplomatic", "sanction", "party"],
    "business":      ["market", "economy", "trade", "stock", "company", "investment", "bank",
                      "inflation", "export", "import", "startup", "revenue", "deal"],
    "technology":    ["ai", "software", "app", "chip", "tech", "cyber", "data", "robot",
                      "internet", "device", "startup", "smartphone", "platform"],
    "health":        ["health", "hospital", "disease", "virus", "outbreak", "vaccine",
                      "patient", "medical", "doctor", "mental"],
    "sports":        ["match", "league", "player", "goal", "tournament", "championship",
                      "coach", "club", "football", "cricket", "olympic"],
    "entertainment": ["film", "movie", "music", "celebrity", "festival", "actor", "singer",
                      "album", "show", "star", "concert"],
    "environment":   ["climate", "weather", "flood", "earthquake", "storm", "wildfire",
                      "heat", "pollution", "drought", "emission"],
}

# Sensitive-content signals → these raise the sensitivity level.
SENSITIVE_KEYWORDS = [
    "kill", "killed", "murder", "dead", "death", "shooting", "shot", "stab", "massacre",
    "bomb", "explosion", "terror", "war", "assault", "abuse", "rape", "kidnap", "hostage",
    "suicide", "trafficking", "drug", "scam", "fraud", "riot", "protest", "crash",
    "accident", "disaster", "outbreak", "victim", "weapon", "violence",
]

_WORD = re.compile(r"[a-z]+")


def _tokens(text):
    return set(_WORD.findall((text or "").lower()))


def classify(text):
    """Return {'type': str, 'sensitivity': 'none'|'medium'|'high', 'sensitive': bool}."""
    low = (text or "").lower()
    toks = _tokens(low)

    # Type: score each category, pick the strongest (phrase-aware via substring).
    scores = {}
    for ty, kws in TYPE_KEYWORDS.items():
        scores[ty] = sum(1 for kw in kws if (kw in low if " " in kw else kw in toks))
    best = max(scores, key=scores.get)
    content_type = best if scores[best] > 0 else "general"

    # Sensitivity: how many distinct sensitive signals appear.
    hits = sum(1 for kw in SENSITIVE_KEYWORDS if (kw in low if " " in kw else kw in toks))
    if hits >= 3:
        sensitivity = "high"
    elif hits >= 1:
        sensitivity = "medium"
    else:
        sensitivity = "none"

    return {"type": content_type, "sensitivity": sensitivity, "sensitive": sensitivity != "none"}
