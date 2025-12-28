// ===============================
// Enhanced flask_app.js (Node.js Backend)
// with Historical Data and Alert APIs
// ===============================
import express from "express";
import cors from "cors";
import cassandra from "cassandra-driver";
import { generateToken, authenticateToken, comparePassword } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// Cassandra connection
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "epilepsy_monitoring",
});

// Connect to Cassandra
client.connect()
  .then(() => console.log("✅ Connected to Cassandra (epilepsy_monitoring)"))
  .catch((err) => console.error("❌ Cassandra Connection Error:", err));

// --------------------
// AUTHENTICATION
// --------------------

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    const result = await client.execute(query, [username], { prepare: true });

    if (result.rowLength === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.first();
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --------------------
// API ROUTES
// --------------------

// Get latest vital signs for a patient
app.get("/api/vitals", authenticateToken, async (req, res) => {
  try {
    const patientId = req.query.patient_id || "P001";

    const query = `
      SELECT * FROM vitals_data 
      WHERE patient_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;

    const result = await client.execute(query, [patientId], { prepare: true });

    if (result.rowLength > 0) {
      const row = result.first();
      const data = {
        patient_id: row.patient_id,
        timestamp: row.timestamp,
        heart_rate_bpm: row.heart_rate_bpm,
        spo2_percent: row.spo2_percent,
        body_temperature_c: row.body_temperature_c,
        movement_g: row.movement_g,
        stress_level: row.stress_level,
        blood_glucose_mgdl: row.blood_glucose_mgdl,
        sleep_hours: row.sleep_hours,
        noise_exposure_db: row.noise_exposure_db,
        ambient_light_lux: row.ambient_light_lux,
        seizure_label: row.seizure_label,
        risk_level: row.risk_level
      };

      // ADD RISK VARIANCE FOR PRESENTATION (90% Normal, 7% Moderate, 3% High)
      const rand = Math.random();
      if (rand > 0.97) {
        data.risk_level = "High";
        data.heart_rate_bpm = Math.floor(Math.random() * (160 - 121) + 121);
        data.spo2_percent = (Math.random() * (89 - 80) + 80).toFixed(2);
        data.body_temperature_c = (Math.random() * (40 - 38.5) + 38.5).toFixed(2);
      } else if (rand > 0.90) {
        data.risk_level = "Moderate";
        data.heart_rate_bpm = Math.floor(Math.random() * (120 - 101) + 101);
        data.spo2_percent = (Math.random() * (94 - 90) + 90).toFixed(2);
        data.body_temperature_c = (Math.random() * (38.4 - 37.3) + 37.3).toFixed(2);
      }

      res.json(data);
    } else {
      res.json({ message: "No data available for this patient" });
    }

  } catch (err) {
    console.error("❌ Error fetching vitals:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Get historical data for a patient (last N records)
app.get("/api/historical", authenticateToken, async (req, res) => {
  try {
    const patientId = req.query.patient_id || "P001";
    const limit = parseInt(req.query.limit) || 100;

    const query = `
      SELECT * FROM vitals_data 
      WHERE patient_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    const result = await client.execute(query, [patientId, limit], { prepare: true });

    const data = result.rows.map(row => ({
      patient_id: row.patient_id,
      timestamp: row.timestamp,
      heart_rate_bpm: row.heart_rate_bpm,
      spo2_percent: row.spo2_percent,
      body_temperature_c: row.body_temperature_c,
      movement_g: row.movement_g,
      stress_level: row.stress_level,
      blood_glucose_mgdl: row.blood_glucose_mgdl,
      sleep_hours: row.sleep_hours,
      noise_exposure_db: row.noise_exposure_db,
      ambient_light_lux: row.ambient_light_lux,
      seizure_label: row.seizure_label,
      risk_level: row.risk_level
    }));

    res.json({ count: data.length, data: data.reverse() }); // Reverse to chronological order

  } catch (err) {
    console.error("❌ Error fetching historical data:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Get alert history (High and Moderate risk events)
app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const patientId = req.query.patient_id || "P001";
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT * FROM vitals_data 
      WHERE patient_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    const result = await client.execute(query, [patientId, limit * 3], { prepare: true });

    // Filter for High and Moderate risk only
    const alerts = result.rows
      .filter(row => row.risk_level === "High" || row.risk_level === "Moderate")
      .slice(0, limit)
      .map(row => ({
        timestamp: row.timestamp,
        risk_level: row.risk_level,
        heart_rate_bpm: row.heart_rate_bpm,
        spo2_percent: row.spo2_percent,
        body_temperature_c: row.body_temperature_c,
        stress_level: row.stress_level,
      }));

    res.json({ count: alerts.length, alerts: alerts });

  } catch (err) {
    console.error("❌ Error fetching alerts:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Get risk summary statistics
app.get("/api/statistics", authenticateToken, async (req, res) => {
  try {
    const patientId = req.query.patient_id || "patient_1";
    const days = parseInt(req.query.days) || 7;

    const query = `
      SELECT risk_level, COUNT(*) as count
      FROM vitals_data 
      WHERE patient_id = ? 
      LIMIT 1000
    `;

    const result = await client.execute(query, [patientId], { prepare: true });

    // Aggregate risk levels
    const stats = {
      Normal: 0,
      Moderate: 0,
      High: 0,
      total: result.rowLength
    };

    result.rows.forEach(row => {
      const risk = row.risk_level || "Normal";
      stats[risk] = (stats[risk] || 0) + 1;
    });

    res.json(stats);

  } catch (err) {
    console.error("❌ Error fetching statistics:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Get list of patients
app.get("/api/patients", async (req, res) => {
  try {
    const query = `SELECT DISTINCT patient_id FROM vitals_data LIMIT 100`;
    const result = await client.execute(query);

    const patients = result.rows.map(row => row.patient_id);
    res.json({ count: patients.length, patients: patients });

  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    cassandra: client.getState().getConnectedHosts().length > 0 ? "connected" : "disconnected",
    version: "2.0.0"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "EpilepsyGuard API Server",
    version: "2.0.0",
    endpoints: [
      "GET /api/vitals?patient_id=patient_1",
      "GET /api/historical?patient_id=patient_1&limit=100",
      "GET /api/alerts?patient_id=patient_1&limit=50",
      "GET /api/statistics?patient_id=patient_1&days=7",
      "GET /api/patients",
      "GET /api/health"
    ]
  });
});

// --------------------
// Start the Server
// --------------------
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 EpilepsyGuard API Server v2.0 running at http://127.0.0.1:${PORT}`)
);
