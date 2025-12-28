import sys, time, random, datetime
from cassandra.cluster import Cluster

# Connect to Cassandra
cluster = Cluster(['127.0.0.1'])
session = cluster.connect('epilepsy_monitoring')

# Patient List
PATIENTS = [
    {"id": "P001", "name": "Arjun Sharma"},
    {"id": "P002", "name": "Priya Lakshmi"},
    {"id": "P003", "name": "Ishaan Verma"}
]

def generate_patient_state():
    """90% Normal, 7% Moderate, 3% High"""
    states = ["Normal", "Moderate", "High"]
    probabilities = [0.90, 0.07, 0.03]
    return random.choices(states, weights=probabilities, k=1)[0]

def generate_vitals_for_state(state):
    """Generate vitals matching the risk level"""
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
    else:  # High
        hr = random.randint(121, 160)
        spo2 = round(random.uniform(80, 89), 2)
        temp = round(random.uniform(38.5, 40.0), 2)
        stress = random.randint(8, 10)
        movement = round(random.uniform(3.1, 5.0), 2)
    
    return hr, spo2, temp, stress, movement

print("🔥 Direct Cassandra Data Generator Started")
print("Generating varied risk levels: 90% Normal, 7% Moderate, 3% High")

while True:
    for patient in PATIENTS:
        state = generate_patient_state()
        hr, spo2, temp, stress, movement = generate_vitals_for_state(state)
        
        # Generate other fields
        glucose = random.randint(70, 150)
        sleep = round(random.uniform(5.0, 9.0), 1)
        noise = round(random.uniform(20, 70), 2)
        light = round(random.uniform(100, 500), 2)
        timestamp = datetime.datetime.utcnow()
        
        # Insert directly into Cassandra
        query = """
        INSERT INTO patient_vitals (
            patient_id, timestamp, heart_rate_bpm, spo2_percent, 
            body_temperature_c, movement_g, stress_level, 
            blood_glucose_mgdl, sleep_hours, noise_exposure_db, 
            ambient_light_lux, risk_level
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        session.execute(query, (
            patient["id"], timestamp, hr, spo2, temp, movement, 
            stress, glucose, sleep, noise, light, state
        ))
        
        print(f"📤 {patient['name']} ({patient['id']}): {state} | HR:{hr} SPO2:{spo2} TEMP:{temp}")
    
    time.sleep(3)  # Every 3 seconds
