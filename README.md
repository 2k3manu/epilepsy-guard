# 🛡️ EpilepsyGuard: Real-Time Seizure Prediction System

### **MCA Capstone Project – PES University**

**Author:** _Manu N M (PES1PG24CA269)_  
**Guide:** _Mr. Dilip Kumar Maripuri, Associate Professor_  
**Version:** _2.2.1-FINAL_

---

## ⭐ Project Overview

A full-stack, enterprise-grade real-time healthcare monitoring ecosystem for epileptic patients. The system ingests multi-modal biometric data from simulated IoT wearable sensors, processes it through a distributed Big Data streaming pipeline, and delivers **sub-500ms seizure risk predictions** to a secure clinical dashboard.

### Core Capabilities

- 🔬 **Distributed Streaming Pipeline** — Apache Kafka → Apache Flink (PyFlink) → Apache Cassandra
- 🧠 **ML Prediction Engine** — Random Forest classifier with **92% precision, 89% recall** on 9 physiological features
- 🔐 **JWT Authentication** with role-based access control (Doctor, Caregiver, Patient)
- ⚙️ **Dynamic Per-Patient Alert Thresholds** with retroactive risk recalculation
- 📊 **Real-time Clinical Dashboard** with EEG waveform visualization, vital trends, and alert system
- 📄 **Automated PDF Clinical Reports** with risk summaries and vitals history
- 🏗️ **Scalable Architecture** — validated for 150+ concurrent patients on commodity hardware

---

## 🧱 System Architecture

```
      ┌──────────────────┐
      │  IoT Wearable    │
      │  Sensors (Sim.)  │
      └──────┬───────────┘
             │ Kafka Producer (Python)
             ▼
      ┌──────────────┐
      │ Apache Kafka │  ← Topic: epilepsy_telemetry
      └──────┬───────┘
             │ Stream Processing
             ▼
      ┌────────────────────────┐
      │ Apache Flink (PyFlink) │
      │  • Feature Extraction  │
      │  • RF ML Inference     │
      │  • Risk Classification │
      └──────┬─────────────────┘
             │ Predictions + Vitals
             ▼
      ┌──────────────────┐
      │ Apache Cassandra │  ← vitals_data + users tables
      └──────┬───────────┘
             │ REST API (JWT Secured)
             ▼
      ┌────────────────────────────────┐
      │ Node.js/Express Backend        │
      │  • /api/login (JWT Auth)       │
      │  • /api/vitals (Real-time)     │
      │  • /api/historical             │
      │  • /api/alerts                 │
      │  • /api/statistics             │
      └──────┬─────────────────────────┘
             │
             ▼
      ┌────────────────────────────────┐
      │ React.js Clinical Dashboard    │
      │  • Live Vitals (9 metrics)     │
      │  • EEG Waveform Canvas         │
      │  • Recharts Trend Graphs       │
      │  • Alert System + Audio        │
      │  • PDF Report Generator        │
      │  • Dynamic Threshold Settings  │
      └────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Ingestion** | Apache Kafka 3.5.1 |
| **Stream Processing** | Apache Flink 1.14.6 (PyFlink) |
| **Storage** | Apache Cassandra 4.1.3 |
| **Backend** | Node.js 18 / Express 5 |
| **Frontend** | React.js 19 / Recharts / jsPDF |
| **ML Model** | Random Forest (scikit-learn) |
| **Auth** | JWT (jsonwebtoken) / bcryptjs |
| **Data Generation** | Python 3.10+ (kafka-python, cassandra-driver) |
| **Platform** | WSL2 (Ubuntu 22.04) |

---

## 🔐 User Roles & Permissions

| Role | Access Level | UI Restrictions |
| :--- | :--- | :--- |
| **Doctor** | Full System Control | View all patients, change thresholds, generate reports |
| **Caregiver** | Monitoring Only | View all patients, no settings, no reports |
| **Patient** | Personal Dashboard | Private view, patient selector & settings hidden |

### Default Credentials
| User | Username | Password | Role |
| :--- | :--- | :--- | :--- |
| Dr. Aditya Kulkarni | `aditya_k` | `admin123` | Doctor |
| Rohan Gupta | `rohan_g` | `admin123` | Caregiver |
| Arjun Sharma | `arjun_s` | `admin123` | Patient (P001) |
| Priya Lakshmi | `priya_l` | `admin123` | Patient (P002) |
| Ishaan Verma | `ishaan_v` | `admin123` | Patient (P003) |

---

## 📊 Dashboard Features

- **Real-time Vitals Monitoring** — Heart Rate, SpO₂, Temperature, Movement, Stress, Blood Glucose, Sleep, Noise, Ambient Light
- **Seizure Risk Indicator** — Color-coded Normal (green) / Moderate (orange) / High (red) with audio alerts
- **EEG Waveform Visualization** — Canvas-based 4-channel simulated EEG (Fp1-F7, F7-T3, T3-T5, T5-O1) that adapts to risk level
- **Vital Trends Chart** — Recharts line graph of last 20 readings (HR, SpO₂, Temperature)
- **Risk Distribution** — Bar chart showing cumulative Normal/Moderate/High event counts
- **24h Prediction Timeline** — Visual risk density strip across the day
- **Recent Activity Log** — Timestamped history with risk-colored indicators
- **Dark/Light Theme** — Persistent toggle

---

## ⚙️ Dynamic Alert Thresholds

Doctors can configure per-patient alert sensitivity:

| Threshold | Default | Description |
| :--- | :--- | :--- |
| Heart Rate Limit | 120 bpm | Alert triggers above this BPM |
| SpO₂ Minimum | 90% | Alert triggers below this percentage |
| Temperature Max | 38.5°C | Alert triggers above this temperature |

- Settings are **saved per patient** and persist across logins (localStorage)
- Threshold changes trigger **retroactive risk recalculation** across all historical data
- **Reset System Defaults** button available to revert

---

## 🧠 Machine Learning

- **Algorithm:** Random Forest Classifier (200 trees, max depth 12)
- **Training Data:** 12,000+ synthetic biosignal records
- **Features (9):** heart_rate_bpm, spo2_percent, body_temperature_c, movement_g, stress_level, blood_glucose_mgdl, sleep_hours, noise_exposure_db, ambient_light_lux
- **Two Models:** Risk Level prediction + Seizure Label prediction
- **Performance:** 92% Precision, 89% Recall, 0.96 AUROC
- **Preprocessing:** StandardScaler normalization, LabelEncoder for risk levels

---

## 🔧 Installation & Deployment

### Prerequisites
- WSL2 (Ubuntu 22.04)
- Node.js 18+ & Python 3.10+
- Apache Kafka, Flink, and Cassandra installed in `tools/` directory

### Quick Start (Full Pipeline)
```bash
# Start all services (Cassandra → Zookeeper → Kafka → Data Generator → Flink → Backend → Frontend)
bash start_demo.sh
```

### Restart Services Only
```bash
# Restart data generator, backend, and frontend (assumes infrastructure is running)
bash restart_services_wsl.sh
```

### Stop All Services
```bash
bash stop_all.sh
```

### Access Points
| Service | URL |
| :--- | :--- |
| Dashboard | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Predictor API | http://localhost:8000 |

---

## 📁 Project Structure

```
EpilepsyGuard/
├── backend/
│   ├── flask_app.js          # Node.js/Express API server (port 5000)
│   ├── auth.js               # JWT authentication & bcrypt utilities
│   ├── predictor_api.py      # Flask ML predictor API (port 6000)
│   ├── users_schema.cql      # Cassandra users table schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main dashboard component (639 lines)
│   │   ├── App.css           # Complete styling with dark mode
│   │   ├── components/
│   │   │   ├── Login.js      # JWT login form
│   │   │   ├── Settings.js   # Dynamic threshold configuration modal
│   │   │   ├── EEGWaveform.js # Canvas-based EEG visualization
│   │   │   └── PredictionTimeline.js  # 24h risk timeline
│   │   └── utils/
│   │       └── ReportGenerator.js  # jsPDF clinical report generator
│   └── package.json
├── reports/
│   ├── Report_Plag.tex       # LaTeX source for Phase-2 report
│   ├── report.tex            # LaTeX source (alternate version)
│   ├── Final Report.pdf      # Compiled final submission PDF
│   ├── Screenshots/          # Dashboard & system screenshots
│   └── Diagrams/             # Architecture & flow diagrams
├── data_generator.py         # Kafka producer (3 patients, 3sec intervals)
├── direct_cassandra_generator.py  # Direct Cassandra data insertion
├── kafka_to_cassandra.py     # Standalone Kafka → Cassandra consumer
├── flink_processor.py        # PyFlink stream processor with ML inference
├── train_rf.py               # Random Forest model training
├── generate_synthetic_data.py # 12K-row synthetic dataset generator
├── predictor_api.py          # Standalone Flask ML API (port 8000)
├── import_real_data.py        # Kaggle dataset importer
├── init_schema.cql           # Cassandra keyspace & vitals_data schema
├── start_demo.sh             # Full pipeline startup script
├── restart_services_wsl.sh   # Quick restart script
├── stop_all.sh               # Graceful shutdown script
├── requirements.txt          # Python dependencies
├── rf_risk_model.joblib      # Trained RF risk model
├── rf_seizure_model.joblib   # Trained RF seizure model
├── scaler.joblib             # StandardScaler artifact
├── label_encoder.joblib      # LabelEncoder artifact
└── patient_seizure_dataset.csv  # Training dataset (12K+ rows)
```

---

## 📑 Reports & Documentation

- **Phase-1 Report** — `reports/Phase 1.pdf`
- **Phase-2 Final Report** — `reports/Final Report.pdf`
- **LaTeX Source** — `reports/Report_Plag.tex` (primary), `reports/report.tex` (alternate)
- **Architecture Diagram** — `architecture Diagram.png`
- **Plagiarism Report** — `reports/Plagiarism.png`

---

## 📜 License

Open-source for educational use.

---

**Last Updated:** May 14, 2026  
**Status:** 🚀 2.2.1-FINAL — Capstone Phase-2 Submission Complete
