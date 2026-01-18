"""
Training script for the NLP-based expense categorization model.

Generates synthetic receipt-like training data from the same 12 categories
used in the Node.js categorizationService.js, then trains a TF-IDF + 
Multinomial Naive Bayes pipeline.

Usage:
    python train.py
"""

import os
import random
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report


# ---------------------------------------------------------------------------
# Category definitions — mirrors backend/services/categorizationService.js
# ---------------------------------------------------------------------------
CATEGORY_DATA = {
    "Food & Dining": {
        "keywords": [
            "restaurant", "cafe", "coffee", "pizza", "burger", "food", "diner",
            "bistro", "grill", "bar", "pub", "mcdonald", "subway", "starbucks",
            "dunkin", "kitchen", "buffet", "bakery", "doordash", "ubereats",
            "grubhub",
        ],
        "templates": [
            "{kw} receipt total ${amount}",
            "order from {kw} paid ${amount} tip included",
            "{kw} drive thru combo meal ${amount}",
            "thank you for dining at {kw} total ${amount}",
            "{kw} latte espresso cappuccino ${amount}",
            "delivery order {kw} food items subtotal ${amount}",
            "{kw} breakfast lunch dinner special ${amount}",
            "bill from {kw} server table total ${amount}",
        ],
    },
    "Groceries": {
        "keywords": [
            "grocery", "supermarket", "market", "walmart", "target", "costco",
            "trader joe", "whole foods", "kroger", "safeway", "publix", "aldi",
            "food lion", "wegmans",
        ],
        "templates": [
            "{kw} store receipt produce dairy total ${amount}",
            "{kw} shopping cart items milk bread eggs ${amount}",
            "receipt {kw} organic vegetables fruits ${amount}",
            "{kw} weekly groceries household items ${amount}",
            "{kw} checkout lane total items purchased ${amount}",
            "fresh produce meat bakery {kw} total ${amount}",
        ],
    },
    "Transportation": {
        "keywords": [
            "uber", "lyft", "taxi", "cab", "gas", "fuel", "parking", "metro",
            "subway", "train", "bus", "transit", "shell", "exxon", "chevron",
            "bp", "mobil",
        ],
        "templates": [
            "{kw} ride fare trip total ${amount}",
            "{kw} station gallons unleaded premium ${amount}",
            "{kw} monthly pass commute fare ${amount}",
            "trip receipt {kw} miles distance ${amount}",
            "{kw} parking garage hourly rate ${amount}",
            "fuel pump {kw} gallons price per gallon ${amount}",
        ],
    },
    "Shopping": {
        "keywords": [
            "amazon", "ebay", "shop", "store", "mall", "retail", "best buy",
            "apple store", "nike", "outlet", "boutique", "department",
        ],
        "templates": [
            "{kw} order shipped items purchased ${amount}",
            "{kw} online purchase confirmation total ${amount}",
            "receipt {kw} electronics clothing accessories ${amount}",
            "{kw} sale discount clearance total ${amount}",
            "{kw} checkout order number items ${amount}",
            "purchase at {kw} merchandise total ${amount}",
        ],
    },
    "Entertainment": {
        "keywords": [
            "cinema", "movie", "theater", "theatre", "netflix", "spotify",
            "hulu", "disney", "concert", "ticket", "amusement", "museum",
            "gaming", "steam",
        ],
        "templates": [
            "{kw} subscription monthly billing ${amount}",
            "{kw} tickets admission entry fee ${amount}",
            "{kw} show performance seat total ${amount}",
            "digital purchase {kw} streaming service ${amount}",
            "{kw} event pass general admission ${amount}",
            "{kw} membership renewal annual plan ${amount}",
        ],
    },
    "Healthcare": {
        "keywords": [
            "pharmacy", "hospital", "clinic", "doctor", "medical", "health",
            "cvs", "walgreens", "rite aid", "dental", "vision", "urgent care",
        ],
        "templates": [
            "{kw} prescription medication copay ${amount}",
            "{kw} visit consultation fee total ${amount}",
            "receipt {kw} lab test checkup ${amount}",
            "{kw} office visit specialist referral ${amount}",
            "{kw} supplies vitamins supplements ${amount}",
            "payment {kw} treatment procedure ${amount}",
        ],
    },
    "Utilities": {
        "keywords": [
            "electric", "electricity", "water", "gas utility", "internet",
            "phone", "mobile", "verizon", "at&t", "comcast", "spectrum",
            "utility",
        ],
        "templates": [
            "{kw} monthly bill statement amount due ${amount}",
            "{kw} service charge account payment ${amount}",
            "{kw} plan usage data unlimited ${amount}",
            "payment received {kw} billing period ${amount}",
            "{kw} automatic payment deducted ${amount}",
        ],
    },
    "Travel": {
        "keywords": [
            "hotel", "motel", "airbnb", "airline", "flight", "airport",
            "travel", "booking", "expedia", "marriott", "hilton", "resort",
        ],
        "templates": [
            "{kw} reservation confirmation nights ${amount}",
            "{kw} booking departure arrival ${amount}",
            "receipt {kw} room suite accommodation ${amount}",
            "{kw} round trip ticket economy class ${amount}",
            "{kw} check in checkout stay total ${amount}",
            "{kw} vacation package all inclusive ${amount}",
        ],
    },
    "Education": {
        "keywords": [
            "university", "college", "school", "tuition", "course", "book",
            "bookstore", "education", "academy", "learning",
        ],
        "templates": [
            "{kw} semester fee enrollment registration ${amount}",
            "{kw} textbook materials supplies ${amount}",
            "{kw} online class certification ${amount}",
            "payment {kw} program degree credits ${amount}",
            "{kw} workshop training seminar fee ${amount}",
        ],
    },
    "Personal Care": {
        "keywords": [
            "salon", "spa", "barber", "beauty", "gym", "fitness", "yoga",
            "massage", "nail", "hair",
        ],
        "templates": [
            "{kw} appointment session service ${amount}",
            "{kw} membership monthly annual ${amount}",
            "receipt {kw} treatment styling cut ${amount}",
            "{kw} products skincare wellness ${amount}",
            "{kw} class session personal training ${amount}",
        ],
    },
    "Insurance": {
        "keywords": [
            "insurance", "policy", "premium", "geico", "state farm",
            "allstate", "progressive",
        ],
        "templates": [
            "{kw} monthly premium payment ${amount}",
            "{kw} coverage plan deductible ${amount}",
            "payment {kw} renewal annual ${amount}",
            "{kw} auto home life health plan ${amount}",
            "{kw} claim statement billing ${amount}",
        ],
    },
    "Other": {
        "keywords": [
            "misc", "general", "other", "miscellaneous", "various",
            "payment", "charge", "fee", "service",
        ],
        "templates": [
            "receipt {kw} charge total ${amount}",
            "{kw} transaction payment processed ${amount}",
            "invoice {kw} services rendered ${amount}",
            "{kw} purchase item total ${amount}",
        ],
    },
}

# Common receipt noise to mix in for realism
RECEIPT_NOISE = [
    "thank you", "have a nice day", "change due", "subtotal", "tax",
    "visa", "mastercard", "debit", "credit", "card ending", "approved",
    "transaction", "date", "time", "cashier", "register", "store number",
    "member", "loyalty", "points", "save", "you saved", "rewards",
]


def generate_amount():
    """Generate a realistic dollar amount string."""
    return f"{random.uniform(1.50, 500.00):.2f}"


def generate_date():
    """Generate a realistic date string."""
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    year = random.choice([2024, 2025, 2026])
    fmt = random.choice([
        f"{month:02d}/{day:02d}/{year}",
        f"{year}-{month:02d}-{day:02d}",
        f"{month}/{day}/{year}",
    ])
    return fmt


def generate_training_data(samples_per_category=50):
    """
    Generate synthetic receipt text samples for each category.
    
    Returns:
        texts (list[str]): Receipt text samples
        labels (list[str]): Corresponding category labels
    """
    texts = []
    labels = []

    for category, data in CATEGORY_DATA.items():
        keywords = data["keywords"]
        templates = data["templates"]

        for _ in range(samples_per_category):
            # Pick a random keyword and template
            kw = random.choice(keywords)
            template = random.choice(templates)
            amount = generate_amount()

            # Build the sample text
            text = template.format(kw=kw, amount=amount)

            # Add random noise tokens for realism
            noise_count = random.randint(1, 4)
            noise_tokens = random.sample(RECEIPT_NOISE, min(noise_count, len(RECEIPT_NOISE)))
            text = f"{text} {' '.join(noise_tokens)}"

            # Occasionally add a date
            if random.random() > 0.5:
                text = f"{generate_date()} {text}"

            texts.append(text)
            labels.append(category)

    return texts, labels


def train_model():
    """Train the TF-IDF + Multinomial Naive Bayes model and save artifacts."""
    print("=" * 60)
    print("  Expense Categorization Model Training")
    print("=" * 60)

    # Generate training data
    print("\n[1/4] Generating synthetic training data...")
    texts, labels = generate_training_data(samples_per_category=50)
    print(f"  Generated {len(texts)} samples across {len(set(labels))} categories")

    # Split data
    print("\n[2/4] Splitting into train/test sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"  Train: {len(X_train)} samples | Test: {len(X_test)} samples")

    # Train TF-IDF vectorizer
    print("\n[3/4] Training TF-IDF vectorizer + Naive Bayes classifier...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        lowercase=True,
        sublinear_tf=True,
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # Train Multinomial Naive Bayes
    model = MultinomialNB(alpha=0.1)
    model.fit(X_train_tfidf, y_train)

    # Evaluate
    y_pred = model.predict(X_test_tfidf)
    accuracy = np.mean(y_pred == np.array(y_test))
    print(f"\n  Test Accuracy: {accuracy:.2%}")
    print("\n  Classification Report:")
    print("-" * 60)
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model artifacts
    print("[4/4] Saving model artifacts...")
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "model.pkl")
    vectorizer_path = os.path.join(model_dir, "vectorizer.pkl")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"  Saved model     → {model_path}")
    print(f"  Saved vectorizer → {vectorizer_path}")
    print(f"\n  Model file size:      {os.path.getsize(model_path) / 1024:.1f} KB")
    print(f"  Vectorizer file size: {os.path.getsize(vectorizer_path) / 1024:.1f} KB")
    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    train_model()
