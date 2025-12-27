# EpilepsyGuard User Guide

**Version:** 2.0.0  
**Last Updated:** December 27, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Features](#features)
5. [Understanding Risk Levels](#understanding-risk-levels)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Introduction

**EpilepsyGuard** is a real-time epileptic seizure monitoring and prediction system designed to help healthcare providers and caregivers monitor patients at risk of epileptic seizures.

### Key Features

- ⚡ **Real-time Monitoring** - Live vital signs tracking
- 🎯 **Seizure Prediction** - ML-powered risk assessment
- 🔔 **Instant Alerts** - Audio and visual notifications for high-risk events
- 📊 **Historical Analysis** - Track trends and patterns over time
- 🌓 **Dark Mode** - Eye-friendly interface for 24/7 monitoring
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

---

## Getting Started

### System Requirements

- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection:** Required for real-time data streaming
- **Screen Resolution:** Minimum 1024x768 (1920x1080 recommended)

### Accessing the Dashboard

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. The dashboard will automatically load and connect to the backend server

### First Time Setup

No login or setup required for the current version. The dashboard starts displaying data immediately upon loading.

---

## Dashboard Overview

### Header Section

The header contains:
- **EpilepsyGuard Logo** - Branding and application identifier
- **Connection Status** - Shows if the system is connected to the backend (green dot = connected, red dot = disconnected)
- **Patient Selector** - Dropdown to switch between different patients
- **Theme Toggle** - Switch between light mode (☀️) and dark mode (🌙)

### Main Sections

1. **Patient Information** - Displays current patient ID and last update time
2. **Vital Signs Card** - Real-time vital measurements
3. **Vital Trends Chart** - Historical graph of heart rate, SpO₂, and temperature
4. **Risk Distribution Chart** - Bar chart showing frequency of risk levels
5. **Recent Activity** - Chronological list of recent measurements

---

## Features

### 1. Real-Time Vital Signs Monitoring

The dashboard displays the following vital signs in real-time:

| Vital Sign | Description | Normal Range |
|------------|-------------|--------------|
| ❤️ Heart Rate | Beats per minute | 60-100 bpm |
| 🫁 SpO₂ | Blood oxygen saturation | 95-100% |
| 🌡️ Temperature | Body temperature | 36.1-37.2°C |
| 🦶 Movement | Physical movement intensity | Varies |
| 😤 Stress Level | Psychological stress indicator | 1-10 scale |
| 🍬 Blood Glucose | Blood sugar level | 80-130 mg/dL |
| 💤 Sleep | Hours of sleep | 7-9 hours |
| 🔊 Noise | Ambient noise exposure | 0-85 dB |
| 💡 Light | Ambient light intensity | Varies |

### 2. Seizure Risk Assessment

The system continuously analyzes patient data and provides a **Risk Level**:

- 🟢 **Normal** - Low risk, patient stable
- 🟡 **Moderate** - Elevated risk, increased monitoring recommended
- 🔴 **High** - Critical risk, immediate attention required

The risk level is prominently displayed at the bottom of the vitals card.

### 3. Alert System

#### Alert Notifications

When moderate or high risk is detected, the system:
- Displays a popup alert in the top-right corner
- Plays an audio notification (for High risk only)
- Shows relevant vital sign values
- Allows dismissal by clicking the × button

#### Alert Types

- **Critical Alert (Red)** - High seizure risk detected
- **Warning Alert (Orange)** - Moderate risk detected
- **Info Alert (Green)** - Normal status updates

### 4. Dark Mode

Toggle between light and dark themes using the 🌙/☀️ button in the header.

**Benefits of Dark Mode:**
- Reduced eye strain during extended monitoring sessions
- Better viewing in low-light environments
- Lower screen power consumption

Your theme preference is automatically saved and restored on next visit.

### 5. Patient Selector

Switch between different patients using the dropdown menu in the header. Select from:
- Patient 1
- Patient 2
- Patient 3

The dashboard immediately updates to show data for the selected patient.

### 6. Data Visualization

#### Vital Trends Chart

- **X-Axis:** Time (last 20 readings)
- **Y-Axis:** Vital sign values
- **Lines:**
  - Red - Heart Rate
  - Blue - SpO₂
  - Orange - Body Temperature

**Hover over data points** to see exact values and timestamps.

#### Risk Distribution Chart

Bar chart showing:
- Count of Normal, Moderate, and High risk events
- Color-coded bars matching risk levels
- Helps identify patterns and trends

### 7. Recent Activity Feed

Scrollable list of the last 20 measurements showing:
- Timestamp
- Risk level (color-coded border)
- Key vital signs (HR, SpO₂, Temperature)

---

## Understanding Risk Levels

### How Risk is Calculated

The system uses machine learning algorithms trained on epilepsy datasets to analyze:
- Vital sign patterns
- Historical trends
- Known seizure triggers
- Multi-factor correlations

### What Each Risk Level Means

#### 🟢 Normal
- **Interpretation:** Patient vitals are within acceptable ranges
 - **Action Required:** Continue routine monitoring
- **Notification:** None

#### 🟡 Moderate
- **Interpretation:** Some concerning patterns detected
- **Action Required:** Increase monitoring frequency, review recent activities
- **Notification:** Visual alert with vital sign details

#### 🔴 High
- **Interpretation:** Strong indicators of potential seizure activity
- **Action Required:** 
  - Immediate caregiver notification
  - Patient safety check
  - Review medication compliance
  - Monitor continuously until risk decreases
- **Notification:** Visual + audio alert

### False Positives

Note that the system may occasionally generate false positives. Always use clinical judgment and consult with medical professionals for critical decisions.

---

## Troubleshooting

### Dashboard Not Loading

**Problem:** Blank screen or "Loading..." message persists

**Solutions:**
1. Check that the backend server is running
2. Verify the backend URL is `http://localhost:5000`
3. Clear browser cache and refresh
4. Check browser console for error messages (F12 → Console tab)

### Connection Status Shows Disconnected

**Problem:** Red dot showing "Disconnected" status

**Solutions:**
1. Ensure backend server is running:
   ```bash
   cd backend
   node flask_app.js
   ```
2. Check if Cassandra database is running
3. Verify network connectivity
4. Check backend logs for errors

### No Data Displayed

**Problem:** Dashboard loads but shows "No data available"

**Solutions:**
1. Verify data generator is running
2. Check Kafka and Flink services are active
3. Confirm Cassandra contains data:
   ```bash
   cqlsh -e "SELECT * FROM epilepsy_monitoring.vitals_data LIMIT 5;"
   ```

### Alerts Not Working

**Problem:** No audio notifications for high-risk events

**Solutions:**
1. Check browser audio permissions
2. Unmute browser tab
3. Test browser audio with another website
4. Some browsers block autoplay - click on page to enable audio

### Chart Not Updating

**Problem:** Chart shows old data

**Solutions:**
1. Refresh the page (F5 or Ctrl+R)
2. Check console for JavaScript errors
3. Verify data is being fetched (Network tab in browser DevTools)

---

## FAQ

### Q: How often does the dashboard update?

**A:** The dashboard fetches new data every 5 seconds automatically.

### Q: Can I monitor multiple patients simultaneously?

**A:** Not in the current version. You need to switch between patients using the dropdown selector. Multi-patient view is planned for future releases.

### Q: Is my data stored securely?

**A:** Currently, all data is stored locally in Cassandra without encryption. For production use, implement encryption at rest and in transit.

### Q: Can I export historical data?

**A:** Data export features are planned for future releases. Currently, you can query Cassandra directly using CQL.

### Q: What browsers are supported?

**A:** Chrome, Firefox, Safari (latest 2 versions), and Edge. Internet Explorer is not supported.

### Q: Can I use this on my phone?

**A:** Yes! The dashboard is fully responsive and works on mobile devices. However, desktop viewing is recommended for optimal experience.

### Q: How do I dismiss alerts?

**A:** Click the × button on the top-right corner of the alert popup.

### Q: What should I do if I see a High risk alert?

**A:**
1. Check on the patient immediately
2. Ensure patient is in a safe environment
3. Review vital signs for abnormalities
4. Contact medical staff if necessary
5. Document the event

### Q: Can I customize alert thresholds?

**A:** Customizable thresholds are planned for future releases. Currently, thresholds are managed by the ML model.

### Q: Is there a mobile app?

**A:** A Progressive Web App (PWA) is in development. You can "Add to Home Screen" from your mobile browser for app-like experience.

---

## Support

For technical support or questions:
- **Email:** PES1PG24CA269@pesu.pes.edu
- **GitHub Issues:** (Repository link)
- **Documentation:** See `docs/` folder

---

## Keyboard Shortcuts

- `Ctrl + R` or `F5` - Refresh dashboard
- `F12` - Open browser developer tools
- `Ctrl + +/-` - Zoom in/out

---

**Remember:** EpilepsyGuard is a monitoring tool. Always consult with qualified medical professionals for diagnosis and treatment decisions.

---

*Last Updated: December 27, 2025*  
*Version: 2.0.0*  
*Author: Manu N M*
