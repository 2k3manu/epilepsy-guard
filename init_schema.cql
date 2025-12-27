CREATE KEYSPACE IF NOT EXISTS epilepsy_monitoring WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE epilepsy_monitoring;

CREATE TABLE IF NOT EXISTS vitals_data (
    patient_id text,
    timestamp timestamp,
    heart_rate_bpm int,
    spo2_percent float,
    body_temperature_c float,
    movement_g float,
    stress_level int,
    blood_glucose_mgdl int,
    sleep_hours float,
    noise_exposure_db float,
    ambient_light_lux float,
    seizure_label int,
    risk_level text,
    PRIMARY KEY (patient_id, timestamp)
);
