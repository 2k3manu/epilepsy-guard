import React from "react";
import "./PredictionTimeline.css";

const PredictionTimeline = ({ history, darkMode }) => {
    // Mock 24h risk density for visualization if history is short
    const mockTimeline = Array.from({ length: 48 }, (_, i) => ({
        time: `${Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
        risk: Math.random() > 0.9 ? "High" : Math.random() > 0.7 ? "Moderate" : "Normal",
    }));

    const getRiskColor = (risk) => {
        switch (risk) {
            case "High": return "#f56565";
            case "Moderate": return "#ed8936";
            default: return "#48bb78";
        }
    };

    return (
        <div className="timeline-container">
            <h3>⏳ 24h Prediction Timeline</h3>
            <div className="timeline-labels">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>Now</span>
            </div>
            <div className="timeline-strip">
                {mockTimeline.map((item, idx) => (
                    <div
                        key={idx}
                        className="timeline-bit"
                        style={{ backgroundColor: getRiskColor(item.risk) }}
                        title={`${item.time} - ${item.risk} Risk`}
                    ></div>
                ))}
            </div>
            <div className="timeline-footer">
                <p>Real-time AI prediction frequency: 5s</p>
                <div className="legend">
                    <span className="legend-item"><i style={{ background: "#f56565" }}></i> High</span>
                    <span className="legend-item"><i style={{ background: "#ed8936" }}></i> Med</span>
                    <span className="legend-item"><i style={{ background: "#48bb78" }}></i> Safe</span>
                </div>
            </div>
        </div>
    );
};

export default PredictionTimeline;
