#!/bin/bash
echo "==============================================="
echo "  STOPPING ALL SERVICES FOR EPILPTIC DEMO      "
echo "==============================================="

echo "[1/6] Stopping React Frontend..."
pkill -f "react-scripts" 2>/dev/null

echo "[2/6] Stopping Node Backend..."
pkill -f "flask_app.js" 2>/dev/null
# Only kill specific node processes, not all node processes to avoid breaking Agent Manager

echo "[3/6] Stopping Python Data Generator..."
pkill -f "data_generator.py" 2>/dev/null

echo "[4/6] Stopping Flink Processor & Clusters..."
# Stop the Flink Cluster gracefully first
./tools/flink/flink-1.14.6/bin/stop-cluster.sh 2>/dev/null
# Then kill any lingering flink or pyflink processes
pkill -f "flink" 2>/dev/null
pkill -f "pyflink" 2>/dev/null
pkill -f "beam_boot" 2>/dev/null

echo "[5/6] Stopping Kafka & Zookeeper..."
pkill -f "kafka.Kafka" 2>/dev/null
pkill -f "QuorumPeerMain" 2>/dev/null

echo "[6/6] Stopping Cassandra & Data Gen..."
pkill -f "org.apache.cassandra" 2>/dev/null
pkill -f "data_generator.py" 2>/dev/null

echo "==============================================="
echo " ALL SERVICES STOPPED SUCCESSFULLY 👍"
echo "==============================================="
