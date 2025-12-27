import json, time, random, datetime
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Patient List with Indian Names
PATIENTS = [
    {"id": "P001", "name": "Arjun Sharma"},
    {"id": "P002", "name": "Priya Lakshmi"},
    {"id": "P003", "name": "Ishaan Verma"}
]

def generate_patient_state():
    """Determines the patient's state based on probability."""
    # 90% Normal, 7% Moderate, 3% High Risk
    states = ["Normal", "Moderate", "High"]
    probabilities = [0.90, 0.07, 0.03]
    return random.choices(states, weights=probabilities, k=1)[0]


def generate_vitals_for_state(state):
    """Generates vital signs consistent with the patient's state."""
    if state == "Normal":
        hr = random.randint(60, 100)
        spo2 = round(random.uniform(95, 100), 2)
        temp = round(random.uniform(36.1, 37.2), 2)
        stress = random.randint(1, 4)
        movement = round(random.uniform(0.1, 1.5), 2)
    elif state == "Moderate":
        hr = random.randint(101, 120)
        spo2 = round(random.uniform(90, 94), 2)
        temp = round(random.uniform(37.3, 38.4), 2)
        stress = random.randint(5, 7)
        movement = round(random.uniform(1.6, 3.0), 2)
    else:  # High Risk
        hr = random.randint(121, 160)
        spo2 = round(random.uniform(80, 89), 2)
        temp = round(random.uniform(38.5, 40.0), 2)
        stress = random.randint(8, 10)
        movement = round(random.uniform(3.1, 5.0), 2)
    
    return hr, spo2, temp, stress, movement


def generate_event(patient_id):
    state = generate_patient_state()
    hr, spo2, temp, stress, movement = generate_vitals_for_state(state)
    
    # Other independent variables
    glucose = random.randint(70, 150)
    sleep = round(random.uniform(5.0, 9.0), 1)
    noise = round(random.uniform(20, 70), 2)
    light = round(random.uniform(100, 500), 2)

    # Simple simulated label (Flink will overwrite this with ML prediction)
    if state == "High":
        seizure_label = 1 if random.random() < 0.8 else 0
    elif state == "Moderate":
        seizure_label = 1 if random.random() < 0.1 else 0
    else:
        seizure_label = 0

    return {
        "patient_id": patient_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "heart_rate_bpm": hr,
        "spo2_percent": spo2,
        "body_temperature_c": temp,
        "movement_g": movement,
        "stress_level": stress,
        "blood_glucose_mgdl": glucose,
        "sleep_hours": sleep,
        "noise_exposure_db": noise,
        "ambient_light_lux": light,
        "seizure_label": seizure_label,
        "risk_level": state
    }


print("🔥 Realistic Data Generator Started (Arjun, Priya, Ishaan)")
while True:
    for patient in PATIENTS:
        event = generate_event(patient["id"])
        producer.send("epilepsy_telemetry", event)
        print(f"📤 Sent {patient['name']} ({patient['id']}):", event["risk_level"])
    time.sleep(3)
