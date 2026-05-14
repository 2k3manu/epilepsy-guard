#!/bin/bash
echo "==============================================="
echo "  STARTING REAL-TIME EPILEPTIC MONITORING DEMO "
echo "==============================================="

# Environment Configurations
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export NODE_OPTIONS=--openssl-legacy-provider

# PROJECT ROOT (auto-detect)
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "[1/8] Activating virtual environment..."
source venv/bin/activate

echo "[2/8] Starting Cassandra..."
nohup tools/cassandra/bin/cassandra -R > cassandra.log 2>&1 &
sleep 25
echo "[2b/8] Initializing Cassandra Schema..."
tools/cassandra/bin/cqlsh -f init_schema.cql || echo "Schema requires Cassandra to be fully ready."
tools/cassandra/bin/cqlsh -f backend/users_schema.cql || echo "Users schema requires Cassandra to be fully ready."
sleep 2

echo "[3/8] Starting Zookeeper..."
nohup tools/kafka/bin/zookeeper-server-start.sh tools/kafka/config/zookeeper.properties > zookeeper.log 2>&1 &
sleep 5

echo "[4/8] Starting Kafka Broker..."
nohup tools/kafka/bin/kafka-server-start.sh tools/kafka/config/server.properties > kafka.log 2>&1 &
sleep 5

echo "[5/8] Creating Kafka topic (if not exists)..."
tools/kafka/bin/kafka-topics.sh --create --if-not-exists \
  --topic epilepsy_telemetry \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 --partitions 1

echo "[6/8] Starting Data Generator..."
nohup python3 data_generator.py > data_gen.log 2>&1 &
sleep 2

echo "[7/8] Starting Flink Stream Processor..."
# Start Flink Cluster (JobManager + TaskManager)
tools/flink/flink-1.14.6/bin/start-cluster.sh
sleep 10
# Submit PyFlink Job
tools/flink/flink-1.14.6/bin/flink run -py flink_processor.py > flink_job.log 2>&1 &

echo "[8/8] Starting Backend (Node.js)..."
cd backend
nohup node flask_app.js > backend.log 2>&1 &
cd ..

echo "[DONE] Starting Frontend (React)..."
cd frontend
# npm install --silent # Already installed
HOST=0.0.0.0 nohup npm start > frontend.log 2>&1 &
