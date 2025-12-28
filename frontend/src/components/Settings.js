import React, { useState } from "react";
import "./Settings.css";

const Settings = ({ thresholds, onSave, onClose, onReset }) => {
    const [localThresholds, setLocalThresholds] = useState({ ...thresholds });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalThresholds(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleSave = () => {
        onSave(localThresholds);
        onClose();
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    <h3>⚙️ Alert Threshold Configuration</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="settings-body">
                    <p className="settings-help">Customize when the system triggers Warning and Critical alerts.</p>

                    <div className="setting-row">
                        <label>❤️ Heart Rate Limit (High bpm)</label>
                        <input
                            type="number"
                            name="hrLimit"
                            value={localThresholds.hrLimit}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="setting-row">
                        <label>🫁 SpO₂ Minimum Threshold (%)</label>
                        <input
                            type="number"
                            name="spo2Limit"
                            value={localThresholds.spo2Limit}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="setting-row">
                        <label>🌡️ Max Temperature (°C)</label>
                        <input
                            type="number"
                            name="tempLimit"
                            value={localThresholds.tempLimit}
                            onChange={handleChange}
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="reset-btn"
                        onClick={() => {
                            onReset();
                            onClose();
                        }}
                    >
                        Reset System Defaults
                    </button>
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
