import pandas as pd
import numpy as np
import sys
import os
from datetime import datetime, timedelta

def import_data(input_file="original_data.csv", output_file="patient_seizure_dataset.csv"):
    """
    Imports real-world data, maps columns to project schema, 
    fills missing environmental data with synthetic values,
    and saves the result.
    """
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        print("Please download the dataset from Kaggle and rename it to 'original_data.csv',")
        print("or pass the filename as an argument: python import_real_data.py <filename>")
        return

        print(f"Reading {input_file}...")
    try:
        df_real = pd.read_csv(input_file)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    print(f"   Found columns: {list(df_real.columns)}")

    # --- 1. Column Mapping ---
    # Map known Kaggle column names to our schema
    # Adjust these keys based on the actual CSV header
    column_map = {
        # Potential variations
        "HeartRate": "heart_rate_bpm", "HR": "heart_rate_bpm", "heart_rate": "heart_rate_bpm",
        "SpO2": "spo2_percent", "SPO2": "spo2_percent",
        "Temperature": "body_temperature_c", "Temp": "body_temperature_c",
        "Movement": "movement_g", "Vibration": "movement_g", "Activity": "movement_g",
        "Label": "seizure_label", "Output": "seizure_label", "Class": "seizure_label"
    }

    df_mapped = df_real.rename(columns=column_map)
    
    # Keep only mapped columns that exist in our schema
    target_columns = [
        "heart_rate_bpm", "spo2_percent", "body_temperature_c", "movement_g", "seizure_label"
    ]
    
    available_cols = [c for c in target_columns if c in df_mapped.columns]
    print(f"   Mapped {len(available_cols)}/{len(target_columns)} core columns: {available_cols}")
    
    if len(available_cols) < 3:
        print("Warning: Few columns matched. Please check the input CSV headers.")
        print(f"   Expected variations of: {list(column_map.keys())}")

    # Start with the mapped data
    df_final = df_mapped[available_cols].copy()
    
    # --- 2. Data Cleaning & Normalization ---
    # Ensure numeric
    for col in available_cols:
        df_final[col] = pd.to_numeric(df_final[col], errors='coerce')
    
    df_final = df_final.dropna()
    N_ROWS = len(df_final)
    
    # Normalize Seizure Label (assuming 0=Normal, 1=Seizure)
    if "seizure_label" in df_final.columns:
        # Some datasets use 1=Seizure, others might use different codes. 
        # Assuming standard binary or fixing it here if needed.
        # Example: if dataset uses 1,2,3,4,5 where 1 is seizure (Kaggle specific check might be needed)
        pass 

    # --- 3. Fill Missing Synthetic Columns ---
    print("Generating synthetic environmental data for missing columns...")
    
    # Generate timestamps
    start_time = datetime.now() - timedelta(days=30)
    df_final["time"] = [start_time + timedelta(minutes=i * 0.5) for i in range(N_ROWS)]
    
    # Generate Patient IDs (distribute randomly or sequentially)
    df_final["patient_id"] = [f"patient_{np.random.randint(1, 6)}" for _ in range(N_ROWS)]

    # Synthetic Environmental/Contextual Data
    if "stress_level" not in df_final.columns:
        df_final["stress_level"] = np.random.normal(40, 20, N_ROWS).clip(0, 100).astype(int)
        
    if "blood_glucose_mgdl" not in df_final.columns:
        df_final["blood_glucose_mgdl"] = np.random.normal(95, 20, N_ROWS).clip(60, 180).astype(int)
        
    if "sleep_hours" not in df_final.columns:
        df_final["sleep_hours"] = np.random.normal(7, 1.5, N_ROWS).clip(4, 10).round(1)
        
    if "noise_exposure_db" not in df_final.columns:
        df_final["noise_exposure_db"] = np.random.normal(40, 8, N_ROWS).clip(20, 80).round(2)
        
    if "ambient_light_lux" not in df_final.columns:
        df_final["ambient_light_lux"] = np.random.normal(250, 150, N_ROWS).clip(10, 800).astype(int)

    # Risk Level Logic (Re-apply project logic)
    df_final["risk_level"] = "Normal"
    
    # High Risk: Seizure Label is 1
    if "seizure_label" in df_final.columns:
        df_final.loc[df_final["seizure_label"] == 1, "risk_level"] = "High"
        
    # Moderate Risk: Based on vitals
    if "heart_rate_bpm" in df_final.columns:
        mod_mask = (
            (df_final["heart_rate_bpm"].between(100, 120)) |
            (df_final["stress_level"].between(60, 80))
        )
        # Only set moderate if not already High
        df_final.loc[mod_mask & (df_final["risk_level"] == "Normal"), "risk_level"] = "Moderate"

    # --- 4. Reorder & Save ---
    desired_order = [
        "time", "patient_id", "heart_rate_bpm", "spo2_percent", "body_temperature_c", 
        "movement_g", "stress_level", "blood_glucose_mgdl", "sleep_hours", 
        "noise_exposure_db", "ambient_light_lux", "seizure_label", "risk_level"
    ]
    
    # Filter to only columns that exist (in case some core ones were missing from input)
    final_cols = [c for c in desired_order if c in df_final.columns]
    df_final = df_final[final_cols]

    df_final.to_csv(output_file, index=False)
    print(f"Successfully created {output_file} with {len(df_final)} rows.")
    print(f"   Real data merged with synthetic context.")

if __name__ == "__main__":
    file_arg = sys.argv[1] if len(sys.argv) > 1 else "original_data.csv"
    output_arg = sys.argv[2] if len(sys.argv) > 2 else "patient_seizure_dataset.csv"
    import_data(file_arg, output_arg)
