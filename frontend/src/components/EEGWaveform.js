import React, { useEffect, useRef } from "react";
import "./EEGWaveform.css";

const EEGWaveform = ({ riskLevel, darkMode }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const offsetRef = useRef(0);

    const channels = ["Fp1-F7", "F7-T3", "T3-T5", "T5-O1"];
    const channelColors = ["#4299e1", "#48bb78", "#ed8936", "#9f7aea"];

    const animate = (time) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        const channelHeight = height / channels.length;

        channels.forEach((label, idx) => {
            const baseY = (idx + 0.5) * channelHeight;

            // Label
            ctx.fillStyle = darkMode ? "#a0aec0" : "#4a5568";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText(label, 10, baseY - 10);

            // Waveform
            ctx.beginPath();
            ctx.strokeStyle = channelColors[idx];
            ctx.lineWidth = 1.5;

            for (let x = 0; x < width; x++) {
                const t = (x + offsetRef.current) * 0.05;

                // Base brain waves (Alpha/Beta mix)
                let yOffset = Math.sin(t) * 5 + Math.sin(t * 2.5) * 3;

                // If High Risk, add epileptiform spikes
                if (riskLevel === "High") {
                    if (Math.sin(t * 0.5) > 0.8) {
                        yOffset += (Math.random() - 0.5) * 40; // Spikes
                    }
                } else if (riskLevel === "Moderate") {
                    yOffset += (Math.random() - 0.5) * 15; // Increased noise
                } else {
                    yOffset += (Math.random() - 0.5) * 4; // Normal background
                }

                if (x === 0) {
                    ctx.moveTo(x, baseY + yOffset);
                } else {
                    ctx.lineTo(x, baseY + yOffset);
                }
            }
            ctx.stroke();
        });

        offsetRef.current += 2;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [riskLevel, darkMode]);

    return (
        <div className="eeg-container">
            <div className="eeg-header">
                <h4>🧠 Real-time EEG Monitoring</h4>
                <div className="eeg-legend">
                    <span className="dot" style={{ backgroundColor: "#4299e1" }}></span> Frontal
                    <span className="dot" style={{ backgroundColor: "#48bb78" }}></span> Temporal
                    <span className="dot" style={{ backgroundColor: "#ed8936" }}></span> Occipital
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={240}
                className="eeg-canvas"
            />
        </div>
    );
};

export default EEGWaveform;
