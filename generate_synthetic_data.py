import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_seizure_dataset():
    """
    Generates a realistic synthetic dataset (12,000 rows) for real-time
    epileptic seizure prediction using multimodal biosignals.
    Compatible with Flink, Kafka, Cassandra, and AIML pipeline.
    """

    N_ROWS = 12000
    N_PATIENTS = 5
    SEIZURE_PROB = 0.025  # 2.5% seizure data
    SEIZURE_DURATION = 20  # rows per seizure event (~10 mins)

    # --- Timestamp Series ---
    start_time = datetime.now() - timedelta(days=30)
    timestamps = [start_time + timedelta(minutes=i * 0.5) for i in range(N_ROWS)]
    patient_ids = [f"patient_{np.random.randint(1, N_PATIENTS + 1)}" for _ in range(N_ROWS)]

    # --- Initialize Normal State ---
    df = pd.DataFrame({
        "time": timestamps,
        "patient_id": patient_ids,
        "heart_rate_bpm": np.random.normal(75, 10, N_ROWS).clip(55, 120).astype(int),
        "spo2_percent": np.random.normal(97.8, 1.0, N_ROWS).clip(90, 100).round(1),
        "body_temperature_c": np.random.normal(36.8, 0.4, N_ROWS).clip(36.0, 38.5).round(2),
        "movement_g": np.random.normal(0.9, 0.4, N_ROWS).clip(0.1, 3.5).round(2),
        "stress_level": np.random.normal(40, 20, N_ROWS).clip(0, 100).astype(int),
        "blood_glucose_mgdl": np.random.normal(95, 20, N_ROWS).clip(60, 180).astype(int),
        "sleep_hours": np.random.normal(7, 1.5, N_ROWS).clip(4, 10).round(1),
        "noise_exposure_db": np.random.normal(40, 8, N_ROWS).clip(20, 80).round(2),
        "ambient_light_lux": np.random.normal(250, 150, N_ROWS).clip(10, 800).astype(int),
        "seizure_label": 0,
        "risk_level": "Normal"
    })

    # --- Simulate Sleep Consistency (fixed per patient) ---
    for p in df["patient_id"].unique():
        mask = df["patient_id"] == p
        daily_sleep = np.random.normal(7, 1.0)
        df.loc[mask, "sleep_hours"] = daily_sleep

    # --- Add Seizure Events using .iloc ---
    num_events = int(N_ROWS * SEIZURE_PROB // SEIZURE_DURATION)
    for _ in range(num_events):
        start_idx = np.random.randint(0, N_ROWS - SEIZURE_DURATION)
        end_idx = start_idx + SEIZURE_DURATION

        seizure_slice = df.iloc[start_idx:end_idx]
        seizure_slice["heart_rate_bpm"] = np.random.normal(135, 8, SEIZURE_DURATION).clip(120, 160)
        seizure_slice["spo2_percent"] = np.random.normal(88, 2, SEIZURE_DURATION).clip(80, 92)
        seizure_slice["body_temperature_c"] = np.random.normal(38.4, 0.3, SEIZURE_DURATION).clip(37.8, 39.5)
        seizure_slice["movement_g"] = np.random.normal(3.8, 0.4, SEIZURE_DURATION).clip(2.5, 5.0)
        seizure_slice["stress_level"] = np.random.normal(90, 5, SEIZURE_DURATION).clip(75, 100)
        seizure_slice["blood_glucose_mgdl"] = np.random.normal(65, 5, SEIZURE_DURATION).clip(50, 80)
        seizure_slice["noise_exposure_db"] = np.random.normal(55, 5, SEIZURE_DURATION).clip(45, 75)
        seizure_slice["ambient_light_lux"] = np.random.normal(400, 80, SEIZURE_DURATION).clip(300, 600)
        seizure_slice["seizure_label"] = 1
        seizure_slice["risk_level"] = "High"

        df.iloc[start_idx:end_idx] = seizure_slice

    # --- Add Moderate Risk Data ---
    mod_mask = (
        (df["heart_rate_bpm"].between(100, 120)) |
        (df["stress_level"].between(60, 80)) |
        (df["movement_g"].between(2.0, 3.0))
    )
    df.loc[mod_mask & (df["seizure_label"] == 0), "risk_level"] = "Moderate"

    # --- Clean and Save ---
    df = df.sort_values("time").reset_index(drop=True)
    df.to_csv("patient_seizure_dataset.csv", index=False)

    print(f"✅ Dataset successfully generated with {len(df)} records.")
    print(f"🧠 Seizure Events Simulated: {df['seizure_label'].sum()} rows labeled as seizures.")
    print("💾 File saved as patient_seizure_dataset.csv")


if __name__ == "__main__":
    generate_seizure_dataset()
