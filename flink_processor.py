# /mnt/data/flink_processor.py
from pyflink.datastream import StreamExecutionEnvironment
# from pyflink.datastream.connectors.kafka import KafkaSource  <-- Removed for Flink 1.14
# from pyflink.datastream.connectors.kafka import KafkaOffsetResetStrategy <-- Removed for Flink 1.14
from pyflink.datastream.connectors import FlinkKafkaConsumer
from pyflink.common.serialization import SimpleStringSchema
from pyflink.common.typeinfo import Types
from pyflink.datastream.functions import MapFunction, RuntimeContext
import json
from cassandra.cluster import Cluster
from cassandra.query import PreparedStatement
import os
import time
import joblib
import numpy as np

# === CONFIG ===
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "epilepsy_telemetry")
CASSANDRA_CONTACT_POINTS = os.getenv("CASSANDRA_HOSTS", "127.0.0.1").split(",")
CASSANDRA_KEYSPACE = os.getenv("CASSANDRA_KEYSPACE", "epilepsy_monitoring")
# path to kafka connector jar in your tools folder (adjust if different)
KAFKA_CONNECTOR_JAR = os.getenv("KAFKA_CONNECTOR_JAR",
    f"file://{os.getcwd()}/tools/flink/flink-connector-kafka_2.12-1.14.6.jar"
)

# === FLINK ENV ===
env = StreamExecutionEnvironment.get_execution_environment()
env.add_jars(KAFKA_CONNECTOR_JAR)
env.set_parallelism(1)

# === KAFKA SOURCE (Flink 1.14 Legacy) ===
# Flink 1.14 uses FlinkKafkaConsumer, not KafkaSource
from pyflink.datastream.connectors import FlinkKafkaConsumer

kafka_props = {
    'bootstrap.servers': KAFKA_BOOTSTRAP,
    'group.id': 'flink_consumer_group',
    'auto.offset.reset': 'earliest'
}

kafka_consumer = FlinkKafkaConsumer(
    topics=KAFKA_TOPIC,
    deserialization_schema=SimpleStringSchema(),
    properties=kafka_props
)
kafka_consumer.set_start_from_earliest()

stream = env.add_source(kafka_consumer, source_name="KafkaSource")

# === Cassandra helper inside MapFunction ===
class CassandraInsertFunction(MapFunction):
    def open(self, runtime_context: RuntimeContext):
        # initialize Cassandra connection once per Python worker
        self.cluster = Cluster(CASSANDRA_CONTACT_POINTS)
        # retry connect a few times in case Cassandra is not ready
        attempts = 3
        for i in range(attempts):
            try:
                self.session = self.cluster.connect(CASSANDRA_KEYSPACE)
                break
            except Exception as e:
                if i < attempts - 1:
                    time.sleep(2)
                else:
                    raise

        # Load ML Models
        try:
            # Assuming these verify files are in the working directory where the job runs
            self.rf_model = joblib.load(os.getcwd() + "/rf_seizure_model.joblib")
            self.scaler = joblib.load(os.getcwd() + "/scaler.joblib")
            print("✅ Loaded Random Forest Model & Scaler")
        except Exception as e:
            print(f"❌ Failed to load models: {e}")
            self.rf_model = None
            self.scaler = None

        # prepare insert statement (use consistent column names as your table)
        self.insert_stmt = self.session.prepare("""
            INSERT INTO vitals_data (
                patient_id, timestamp, ambient_light_lux, blood_glucose_mgdl,
                body_temperature_c, heart_rate_bpm, movement_g, noise_exposure_db,
                risk_level, seizure_label, sleep_hours, spo2_percent, stress_level
            ) VALUES (?, toTimestamp(now()), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """)

    def map(self, value):
        try:
            data = json.loads(value)
            
            # --- ML Inference Start ---
            predicted_label = 0
            if self.rf_model and self.scaler:
                try:
                    # Feature order must match training!
                    # heart_rate_bpm, spo2_percent, body_temperature_c, movement_g,
                    # stress_level, blood_glucose_mgdl, sleep_hours, noise_exposure_db, ambient_light_lux
                    features = [
                        float(data.get("heart_rate_bpm", 0)),
                        float(data.get("spo2_percent", 0)),
                        float(data.get("body_temperature_c", 0)),
                        float(data.get("movement_g", 0)),
                        float(data.get("stress_level", 0)),
                        float(data.get("blood_glucose_mgdl", 0)),
                        float(data.get("sleep_hours", 0)),
                        float(data.get("noise_exposure_db", 0)),
                        float(data.get("ambient_light_lux", 0))
                    ]
                    
                    # Reshape for single sample
                    features_scaled = self.scaler.transform([features])
                    prediction = self.rf_model.predict(features_scaled)
                    predicted_label = int(prediction[0])
                    
                    # Update the data dictionary with the prediction
                    data["seizure_label"] = predicted_label
                    print(f"🧠 Prediction: {predicted_label} | Risk: {data.get('risk_level')}")
                    
                except Exception as ml_err:
                    print(f"⚠️ Inference Error: {ml_err}")
            # --- ML Inference End ---

            # Map / fallback for missing keys to avoid exceptions
            vals = (
                data.get("patient_id", "unknown"),
                data.get("ambient_light_lux"),
                data.get("blood_glucose_mgdl"),
                data.get("body_temperature_c"),
                data.get("heart_rate_bpm"),
                data.get("movement_g"),
                data.get("noise_exposure_db"),
                data.get("risk_level"),
                int(data.get("seizure_label", 0)), # This now holds the ML prediction
                data.get("sleep_hours"),
                data.get("spo2_percent"),
                data.get("stress_level"),
            )
            # execute prepared statement
            self.session.execute(self.insert_stmt, vals)
            # return a small acknowledgement string for debugging
            return f"INSERTED: {data.get('patient_id', 'unknown')} @ {data.get('timestamp', '')} | Label: {data.get('seizure_label')}"
        except Exception as e:
            # print to stdout — Flink task logs will capture it
            print("Error processing record:", e, "raw:", value)
            return f"ERROR: {str(e)}"

    def close(self):
        try:
            if hasattr(self, "session"):
                self.session.shutdown()
            if hasattr(self, "cluster"):
                self.cluster.shutdown()
        except Exception:
            pass

# Map stream -> insert into Cassandra
processed = stream.map(CassandraInsertFunction(), output_type=Types.STRING())

# For local debugging it's useful to print output to logs too
processed.print()

env.execute("Epilepsy_Flink_Job_Python")
