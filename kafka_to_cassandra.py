import os
import json
import time
import signal
from threading import Event
from kafka import KafkaConsumer
from cassandra.cluster import Cluster, NoHostAvailable

# ============================================
# CONFIG
# ============================================
KAFKA_BOOTSTRAP = "localhost:9092"
KAFKA_TOPIC = "epilepsy_telemetry"
KAFKA_GROUP = "python_cass_consumer"

CASSANDRA_HOSTS = ["127.0.0.1"]
CASSANDRA_KEYSPACE = "epilepsy_monitoring"

running = True
stop_event = Event()

# ============================================
# Graceful Shutdown
# ============================================
def handle_stop(sig, frame):
    global running
    print("\nStopping consumer...")
    running = False
    stop_event.set()

signal.signal(signal.SIGINT, handle_stop)
signal.signal(signal.SIGTERM, handle_stop)

# ============================================
# Cassandra Connection
# ============================================
def connect_cassandra():
    attempts = 0
    while attempts < 5:
        try:
            cluster = Cluster(CASSANDRA_HOSTS)
            session = cluster.connect(CASSANDRA_KEYSPACE)

            insert_stmt = session.prepare("""
                INSERT INTO vitals_data(
                    patient_id, timestamp, ambient_light_lux, blood_glucose_mgdl,
                    body_temperature_c, heart_rate_bpm, movement_g, noise_exposure_db,
                    risk_level, seizure_label, sleep_hours, spo2_percent, stress_level
                ) VALUES (?, toTimestamp(now()), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """)

            print("[Cassandra] Connected successfully")
            return cluster, session, insert_stmt

        except NoHostAvailable:
            attempts += 1
            print(f"[Cassandra] Connection failed. Retry {attempts}/5...")
            time.sleep(3)

    raise Exception("Cassandra unavailable after 5 attempts")

# ============================================
# Type-Safe Extractor
# ============================================
def to_int_safe(value, default=None):
    try:
        return int(float(value))
    except:
        return default

def to_float_safe(value, default=None):
    try:
        return float(value)
    except:
        return default

# ============================================
# Streaming Processor
# ============================================
def start_processor():
    print("[Kafka] Connecting...")
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BOOTSTRAP],
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id=KAFKA_GROUP,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        consumer_timeout_ms=1000
    )

    print(f"[Kafka] Connected to topic '{KAFKA_TOPIC}'")
    cluster, session, insert_stmt = connect_cassandra()

    try:
        while running:
            try:
                for message in consumer:
                    if not running:
                        break

                    data = message.value

                    # === TYPE FIXES HERE ===
                    patient_id = data.get("patient_id", "unknown")

                    ambient_light = to_float_safe(data.get("ambient_light_lux"))
                    glucose = to_int_safe(data.get("blood_glucose_mgdl"))
                    temp = to_float_safe(data.get("body_temperature_c"))
                    hr = to_int_safe(data.get("heart_rate_bpm"))
                    movement = to_float_safe(data.get("movement_g"))
                    noise = to_float_safe(data.get("noise_exposure_db"))
                    risk = data.get("risk_level", "Normal")

                    seizure = to_int_safe(data.get("seizure_label", 0))
                    sleep = to_int_safe(data.get("sleep_hours"))
                    spo2 = to_int_safe(data.get("spo2_percent"))
                    stress = to_int_safe(data.get("stress_level"))

                    vals = (
                        patient_id,
                        ambient_light,
                        glucose,
                        temp,
                        hr,
                        movement,
                        noise,
                        risk,
                        seizure,
                        sleep,
                        spo2,
                        stress
                    )

                    # Insert into Cassandra
                    try:
                        session.execute(insert_stmt, vals)
                        print(f"[✔ Inserted] patient={patient_id} seizure={seizure}")
                    except Exception as ex:
                        print("[Cassandra] Insert error:", ex)
                        print("Data:", vals)

                time.sleep(0.2)

            except Exception as ke:
                print("[Kafka Error]", ke)
                time.sleep(2)

    finally:
        print("[Shutdown] Closing...")
        try:
            consumer.close()
        except:
            pass
        try:
            session.shutdown()
            cluster.shutdown()
        except:
            pass
        print("[Shutdown] Done.")

# ============================================
# MAIN
# ============================================
if __name__ == "__main__":
    print("\n🔥 REAL-TIME KAFKA → CASSANDRA PROCESSOR (NO FLINK)")
    print("Press CTRL + C to stop.\n")
    start_processor()
