import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import "./App.css";
import Login from "./components/Login";
import EEGWaveform from "./components/EEGWaveform";
import PredictionTimeline from "./components/PredictionTimeline";
import { generatePatientReport } from "./utils/ReportGenerator";
import Settings from "./components/Settings";
import "./components/Settings.css";

function App() {
  const [vitals, setVitals] = useState(null);
  const [history, setHistory] = useState([]);
  const [riskSummary, setRiskSummary] = useState({ Normal: 0, Moderate: 0, High: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("P001");
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState({
    hrLimit: 120,
    spo2Limit: 90,
    tempLimit: 38.5
  });
  const alertSound = useRef(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedThresholds = localStorage.getItem("thresholds");
    if (savedThresholds) {
      setThresholds(JSON.parse(savedThresholds));
    }
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    // If patient, set their patient_id automatically
    if (data.user.role === "patient") {
      const patientIdMap = {
        "arjun_s": "P001",
        "priya_l": "P002",
        "ishaan_v": "P003"
      };
      setSelectedPatient(patientIdMap[data.user.username] || "P001");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const theme = newMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Fetch data function
  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/vitals?patient_id=${selectedPatient}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setVitals(data);
      setIsConnected(true);
      setError(null);

      // Create history entry
      const newEntry = {
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        heart_rate_bpm: data.heart_rate_bpm,
        spo2_percent: data.spo2_percent,
        body_temperature_c: data.body_temperature_c,
        risk_level: data.risk_level,
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 19)]);

      // Update risk summary counts
      setRiskSummary((prev) => ({
        ...prev,
        [data.risk_level]: (prev[data.risk_level] || 0) + 1,
      }));

      // Threshold-based Alert Logic
      let riskDetected = false;
      let riskMsg = "";

      if (data.heart_rate_bpm > thresholds.hrLimit) {
        riskDetected = true;
        riskMsg = `⚠️ Critical Heart Rate: ${data.heart_rate_bpm} bpm`;
      } else if (data.spo2_percent < thresholds.spo2Limit) {
        riskDetected = true;
        riskMsg = `⚠️ Low Oxygen Levels: ${data.spo2_percent.toFixed(1)}%`;
      } else if (data.body_temperature_c > thresholds.tempLimit) {
        riskDetected = true;
        riskMsg = `⚠️ High Temperature: ${data.body_temperature_c.toFixed(1)} °C`;
      }

      // Check for high-risk or threshold breaches
      if (data.risk_level === "High" || riskDetected) {
        addAlert({
          id: Date.now(),
          type: "critical",
          message: riskMsg || "⚠️ High seizure risk detected!",
          time: new Date().toLocaleTimeString(),
          vitals: {
            hr: data.heart_rate_bpm,
            spo2: data.spo2_percent,
            temp: data.body_temperature_c,
          },
        });
        playAlertSound();
      } else if (data.risk_level === "Moderate") {
        addAlert({
          id: Date.now(),
          type: "warning",
          message: "⚡ Moderate risk level detected",
          time: new Date().toLocaleTimeString(),
          vitals: {
            hr: data.heart_rate_bpm,
            spo2: data.spo2_percent,
            temp: data.body_temperature_c,
          },
        });
      }
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      setIsConnected(false);
      setError("Unable to connect to backend API");
    }
  };

  // Alert management
  const addAlert = (alert) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 4)]); // Keep max 5 alerts
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const playAlertSound = () => {
    try {
      if (alertSound.current) {
        alertSound.current.play();
      }
    } catch (err) {
      console.log("Audio play failed:", err);
    }
  };

  // Data fetching effect
  useEffect(() => {
    if (!token || !user) return;

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedPatient, token]);

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "#f56565";
      case "Moderate":
        return "#ed8936";
      default:
        return "#48bb78";
    }
  };

  // Get status class
  const getStatusClass = (risk) => {
    switch (risk) {
      case "High":
        return "status-high";
      case "Moderate":
        return "status-moderate";
      default:
        return "status-normal";
    }
  };

  // Authentication check
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // Loading state
  if (!vitals && !error) {
    return (
      <div className="loading-screen">
        <h2>🧠 EpilepsyGuard</h2>
        <p>Initializing real-time monitoring system...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  // Error state
  if (error && !vitals) {
    return (
      <div className="loading-screen">
        <h2>❌ Connection Error</h2>
        <p>{error}</p>
        <p>Please ensure the backend server is running.</p>
        <button
          onClick={fetchData}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            background: "#4299e1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Hidden audio element for alerts */}
      <audio ref={alertSound} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2i78OWhUBELUKjj8LdjHAU2kdfy0IkwCCB1xe7doUoSCUyg3/G6chsGKHu98NuZUhELRZ3e8btwIAUpgM3y24o0CBlmu+vopVgTCk6k5O+2YhoFN5HY8s+JMAUBU6Pj7rdkGwU4kdby0IkwCCB1xe7doUoSCUyg3/G6chsGKHu98NuZUhELRZ3e8btwIAUpgM3y24o0CBhmu+vopVgTCk6k5O+2YhoFN5HY8tCJMAggdcXu3aFKEglMoN/xunIbBih7vfDbmVIRC0Wd3vG7cCAFKYDN8tuKNAgYZrvr6KVYE wo OpOTvtmIaBTeR2PLQiTAIIHXF7t2hShIJTKDf8bpyGwYoe73w25lSEQtFnd7xu3AgBSmAzfLbijQIGGa76+ilWBMKTqTk77ZiGgU3kdjy0IkwCCB1xe7doUoSCUyg3/G6ciUIIHXF7t2hShIJTKDf8bpyGwYoe73w25lSEQtFnd7xu3ATrppACUpfgCFKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIkpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4AiSmOAIUpjgCJKY4ArppACUpfh" preload="auto" />

      {/* Alert Panel */}
      <div className="alert-panel">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {alert.message}
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                {alert.time} | HR: {alert.vitals.hr} bpm | SpO₂:{" "}
                {alert.vitals.spo2.toFixed(1)}%
              </div>
            </div>
            <button className="alert-close" onClick={() => removeAlert(alert.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <span>🧠</span>
              EpilepsyGuard
            </h1>
            {user && (
              <span className="user-badge">
                {user.role === "doctor" ? "👨‍⚕️" : user.role === "patient" ? "🧑‍🦱" : "👩‍⚕️"} {user.full_name}
                <span className="role-pill">{user.role}</span>
              </span>
            )}
          </div>
          <div className="header-actions">
            <div className="connection-status">
              <div className={`status-dot ${isConnected ? "connected" : "disconnected"}`}></div>
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            <select
              className="patient-selector"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="P001">Arjun Sharma (P001)</option>
              <option value="P002">Priya Lakshmi (P002)</option>
              <option value="P003">Ishaan Verma (P003)</option>
            </select>
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            {/* Settings and Report - Only for Doctors */}
            {user && user.role === "doctor" && (
              <>
                <button className="settings-btn" onClick={() => setShowSettings(true)}>
                  ⚙️ Settings
                </button>
                <button
                  className="report-btn"
                  onClick={() => {
                    const patientMap = {
                      "P001": "Arjun Sharma",
                      "P002": "Priya Lakshmi",
                      "P003": "Ishaan Verma"
                    };
                    generatePatientReport(
                      { id: selectedPatient, name: patientMap[selectedPatient] },
                      history,
                      riskSummary
                    );
                  }}
                >
                  📄 Report
                </button>
              </>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        {/* Patient Info - Conditional based on role */}
        {user && user.role !== "patient" && (
          <div style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
            <h3>
              Patient: <span className="highlight">{vitals.patient_id}</span> | Last Updated:{" "}
              {new Date().toLocaleTimeString()}
            </h3>
          </div>
        )}

        {/* Patient View - Only shows their own info */}
        {user && user.role === "patient" && (
          <div className="patient-info-card" style={{ marginBottom: "1.5rem" }}>
            <h2>🧑‍🦱 My Health Dashboard</h2>
            <p className="patient-name-display">{user.full_name} (ID: {selectedPatient})</p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Last Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        )}

        {/* Vitals Display */}
        <section className={`vitals-card ${getStatusClass(vitals.risk_level)}`}>
          <div className="vitals-grid">
            <div className="vital-item">
              <div className="vital-label">❤️ Heart Rate</div>
              <div className="vital-value">{vitals.heart_rate_bpm} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>bpm</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">🫁 SpO₂</div>
              <div className="vital-value">{vitals.spo2_percent?.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>%</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">🌡️ Temperature</div>
              <div className="vital-value">{vitals.body_temperature_c?.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>°C</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">🦶 Movement</div>
              <div className="vital-value">{vitals.movement_g?.toFixed(2)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>g</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">😤 Stress Level</div>
              <div className="vital-value">{vitals.stress_level}</div>
            </div>
            <div className="vital-item">
              <div className="vital-label">🍬 Blood Glucose</div>
              <div className="vital-value">{vitals.blood_glucose_mgdl} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>mg/dL</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">💤 Sleep</div>
              <div className="vital-value">{vitals.sleep_hours?.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>hrs</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">🔊 Noise</div>
              <div className="vital-value">{vitals.noise_exposure_db?.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>dB</span></div>
            </div>
            <div className="vital-item">
              <div className="vital-label">💡 Light</div>
              <div className="vital-value">{vitals.ambient_light_lux?.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>lux</span></div>
            </div>
          </div>

          <div
            className="risk-box"
            style={{
              backgroundColor: getRiskColor(vitals.risk_level),
            }}
          >
            Seizure Risk: {vitals.risk_level}
          </div>
        </section>

        {/* Charts Section */}
        <section className="chart-section">
          <h3>📈 Vital Trends (Last 20 Readings)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4a5568" : "#e2e8f0"} />
              <XAxis dataKey="time" hide />
              <YAxis stroke={darkMode ? "#cbd5e0" : "#4a5568"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#2d3748" : "#ffffff",
                  border: `1px solid ${darkMode ? "#4a5568" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  color: darkMode ? "#f7fafc" : "#1a202c",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="heart_rate_bpm"
                stroke="#ff4d4d"
                name="Heart Rate (bpm)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="spo2_percent"
                stroke="#0078ff"
                name="SpO₂ (%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="body_temperature_c"
                stroke="#ffa31a"
                name="Temperature (°C)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Risk Distribution */}
        <section className="chart-section">
          <h3>⚠️ Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={Object.entries(riskSummary).map(([k, v]) => ({
                name: k,
                value: v,
                fill: getRiskColor(k),
              }))}
            >
              <XAxis dataKey="name" stroke={darkMode ? "#cbd5e0" : "#4a5568"} />
              <YAxis allowDecimals={false} stroke={darkMode ? "#cbd5e0" : "#4a5568"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#2d3748" : "#ffffff",
                  border: `1px solid ${darkMode ? "#4a5568" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  color: darkMode ? "#f7fafc" : "#1a202c",
                }}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Advanced Visualizations */}
        <div className="advanced-visuals-grid">
          <EEGWaveform riskLevel={vitals.risk_level} darkMode={darkMode} />
          <PredictionTimeline history={history} darkMode={darkMode} />
        </div>

        {/* Alert History */}
        <section className="history-card">
          <h3>📜 Recent Activity</h3>
          <div className="history-list">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="history-item"
                style={{ borderLeftColor: getRiskColor(item.risk_level) }}
              >
                <p>
                  <strong>{item.time}</strong> — Risk: {item.risk_level} | HR:{" "}
                  {item.heart_rate_bpm} bpm | SpO₂: {item.spo2_percent?.toFixed(1)}% | Temp:{" "}
                  {item.body_temperature_c?.toFixed(1)}°C
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showSettings && (
        <Settings
          thresholds={thresholds}
          onSave={(newT) => {
            setThresholds(newT);
            localStorage.setItem("thresholds", JSON.stringify(newT));
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
