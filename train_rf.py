import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
)
import joblib


def load_and_prepare(csv_path):
    """Load the dataset and preprocess it."""
    df = pd.read_csv(csv_path)
    print(f"✅ Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # Rename columns if needed
    if "time" in df.columns:
        df.rename(columns={"time": "timestamp"}, inplace=True)

    # Drop columns not needed for training
    drop_cols = ["timestamp", "patient_id"]
    df = df.drop(columns=drop_cols, errors="ignore")

    # Encode categorical 'risk_level'
    label_encoder = LabelEncoder()
    df["risk_level_encoded"] = label_encoder.fit_transform(df["risk_level"])

    # Features and targets
    features = [
        "heart_rate_bpm",
        "spo2_percent",
        "body_temperature_c",
        "movement_g",
        "stress_level",
        "blood_glucose_mgdl",
        "sleep_hours",
        "noise_exposure_db",
        "ambient_light_lux",
    ]
    target_risk = "risk_level_encoded"
    target_seizure = "seizure_label"

    X = df[features]
    y_risk = df[target_risk]
    y_seizure = df[target_seizure]

    # Normalize numerical features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y_risk, y_seizure, label_encoder, scaler


def train_random_forest(X, y, label_name):
    """Train and evaluate a RandomForest model."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    rf = RandomForestClassifier(
        n_estimators=200, max_depth=12, min_samples_split=4, random_state=42
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)

    print(f"\n🧠 Model Performance — {label_name}")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("Classification Report:\n", classification_report(y_test, y_pred))

    return rf


if __name__ == "__main__":
    CSV_PATH = "patient_seizure_dataset.csv"

    # 1️⃣ Load and preprocess data
    X_scaled, y_risk, y_seizure, label_encoder, scaler = load_and_prepare(CSV_PATH)

    # 2️⃣ Train Random Forest for Risk Level
    rf_risk = train_random_forest(X_scaled, y_risk, "Risk Level")

    # 3️⃣ Train Random Forest for Seizure Label
    rf_seizure = train_random_forest(X_scaled, y_seizure, "Seizure Label")

    # 4️⃣ Save trained models and preprocessors
    joblib.dump(rf_risk, "rf_risk_model.joblib")
    joblib.dump(rf_seizure, "rf_seizure_model.joblib")
    joblib.dump(label_encoder, "label_encoder.joblib")
    joblib.dump(scaler, "scaler.joblib")

    print("\n✅ Models saved successfully:")
    print("   • rf_risk_model.joblib")
    print("   • rf_seizure_model.joblib")
    print("   • label_encoder.joblib")
    print("   • scaler.joblib")
