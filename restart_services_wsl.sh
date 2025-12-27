#!/bin/bash
# Project root
PROJECT_DIR="/mnt/d/MCA/EpilepsyGuard"
cd "$PROJECT_DIR"

# Environment
export NODE_OPTIONS=--openssl-legacy-provider

echo "Stopping old services..."
pkill -f "flask_app.js"
pkill -f "data_generator.py"
sleep 2

echo "Starting localized Data Generator (with venv)..."
source venv/bin/activate
nohup python3 data_generator.py > data_gen_localized.log 2>&1 &
echo "Data Generator started."

echo "Starting authenticated Backend (with npm install)..."
cd backend
npm install --silent
nohup node flask_app.js > backend_auth.log 2>&1 &
echo "Backend started."

sleep 2
ps aux | grep -E "flask_app|data_generator"
