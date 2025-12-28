# 🛡️ EpilepsyGuard: Real-Time Seizure Prediction System

### **MCA Capstone Project – PES University**

**Author:** _Manu N M (PES1PG24CA269)_  
**Guide:** _Mr. Dilip Kumar Maripuri, Associate Professor_  
**Version:** _2.2.0-FINAL (Phase 2.2 Complete)_

---

# ⭐ Project Overview

Epileptic seizures are unpredictable and require early detection to prevent injury or medical emergencies.  
This project provides **real-time epileptic seizure prediction** using:

- IoT-based EEG sensors (Simulated Multi-patient)
- Kafka-based data ingestion
- Apache Flink Stream processing
- Machine Learning (Random Forest) prediction model
- Distributed storage with Cassandra
- **Secure web dashboard with JWT authentication**
- **Dynamic Per-Patient Alert Thresholds** (HR, SpO2, Temp)
- **Retroactive Risk Recalculation** (Updates history when thresholds change)
- **Role-based access control** (Doctor, Caregiver, Patient)
- **Real-time EEG waveform visualization**
- **Automated PDF report generation**

The pipeline ensures **low-latency (<1 sec)** prediction and scalable real-time processing with enterprise-grade security and user management.

---

# 🎯 Phase 2.2 FINAL Accomplishments

The final phase of development focused on clinical customization and data accuracy:

- ✅ **Dynamic Patient-Specific Thresholds**: Doctors can now set unique limits for each patient.
- ✅ **Retroactive Risk Calculation**: Changing a threshold immediately recalculates the entire historical risk distribution and timeline.
- ✅ **Enhanced Privacy**: Patient users are strictly locked to their own data; the patient selector and settings are hidden for their role.
- ✅ **Data Robustness**: Implemented strict type parsing and fixed runtime errors (`toFixed`) for high-reliability monitoring.
- ✅ **UI Polish**: Added "Reset System Defaults" functionality with clear orange visual indicators.

---

# 🧱 System Architecture

```
      ┌──────────────┐
      │ EEG Sensor   │
      │ (Simulated)  │
      └──────┬───────┘
             │ Kafka Producer
             ▼
      ┌──────────────┐
      │ Kafka Broker │
      └──────┬───────┘
             │ Streaming Data
             ▼
      ┌────────────────────────┐
      │ Flink Processor        │
      │  • Filtering           │
      │  • Feature Extraction  │
      │  • ML Inference (RF)   │
      └──────┬─────────────────┘
             │ Predictions + Vitals
             ▼
      ┌──────────────┐
      │ Cassandra DB │
      │  • Patients  │
      │  • Users     │
      │  • Vitals    │
      └──────┬───────┘
             │
             ▼
      ┌────────────────────────────────┐
      │ Secure Dashboard (React)       │
      │  • JWT Authentication          │
      │  • Dynamic Risk Calculation    │
      │  • Retroactive History Update  │
      │  • PDF Clinical Reports        │
      │  • Per-Patient Persistence     │
      └────────────────────────────────┘
```

---

# 🛠️ Technologies Used

### **Big Data & Streaming**
- **Apache Kafka** – High-throughput message ingestion.
- **Apache Flink 1.14.6** – Real-time stream processing and ML inference.
- **Apache Cassandra** – Distributed NoSQL storage for patient history.

### **Backend & Machine Learning**
- **Node.js 18.x / Express** – Security, authentication, and API layer.
- **Random Forest Classifier** – Core prediction engine with ~92% accuracy.
- **JWT / Bcrypt** – Secure user management and hashing.

### **Frontend & Visualization**
- **React.js 19.x** – Modern reactive dashboard.
- **Recharts** – Dynamic health trend visualization.
- **jsPDF** – On-the-fly clinical report generation.

---

# 🔐 User Roles & Permissions

| Role | Access Level | UI Restrictions |
| :--- | :--- | :--- |
| **Doctor** | Full System Control | View all patients, Change thresholds, Generate reports. |
| **Caregiver** | Monitoring Only | View all patients, No settings, No reports. |
| **Patient** | Personal Dashboard | Private view, **Patient selector hidden**, Settings hidden. |

### **Default Credentials**
- **Doctor:** `aditya_k` / `admin123`
- **Caregiver:** `rohan_g` / `admin123`
- **Patient P001:** `arjun_s` / `admin123`

---

# 🚨 Enhanced Alerting & Settings

The system allows clinical users to customize sensitivity:

- **Heart Rate Limit**: Warning triggers above BPM limit.
- **SpO₂ Minimum**: Warning triggers if oxygen falls below % (higher is more sensitive).
- **Temperature Max**: Warning triggers on febrile signal detected.
- **Persistence**: All settings are saved locally per patient and persist across logins.

---

# 🔧 Installation & Deployment

## **Prerequisites**
- WSL2 (Ubuntu)
- Node.js 18 & Python 3.8
- Kafka, Flink, and Cassandra tools installed

## **Execution**
Use the unified restart script to initialize the environment:
```bash
bash restart_services_wsl.sh
```

**Access:**
- Dashboard: `http://localhost:3000`
- API Root: `http://localhost:5000`

---

# 🏁 Conclusion

**EpilepsyGuard** demonstrates a full-stack integration of Big Data, IoT simulation, and Clinical UI. The final version provides a robust platform for real-time seizure monitoring, personalized patient care, and secure clinical data management.

---

# 📜 License

Open-source for educational use.

---

**Last Updated:** December 28, 2025  
**Status:** 🚀 2.2.0-FINAL Released
