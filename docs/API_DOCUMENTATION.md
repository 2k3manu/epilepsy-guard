# EpilepsyGuard API Documentation

**Version:** 2.0.0  
**Base URL:** `http://localhost:5000`  
**Protocol:** HTTP/REST  
**Response Format:** JSON

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Get Latest Vitals](#get-latest-vitals)
  - [Get Historical Data](#get-historical-data)
  - [Get Alert History](#get-alert-history)
  - [Get Statistics](#get-statistics)
  - [Get Patient List](#get-patient-list)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Authentication

Currently, the API does not require authentication. This will be implemented in future versions with JWT-based authentication.

---

## Endpoints

### Health Check

Check if the API server and Cassandra database are healthy.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-27T10:30:00.000Z",
  "cassandra": "connected",
  "version": "2.0.0"
}
```

---

### Get Latest Vitals

Retrieve the most recent vital signs data for a specified patient.

**Endpoint:** `GET /api/vitals`

**Query Parameters:**
- `patient_id` (optional, default: `patient_1`) - The ID of the patient

**Example Request:**
```
GET http://localhost:5000/api/vitals?patient_id=patient_1
```

**Response:**
```json
{
  "patient_id": "patient_1",
  "timestamp": "2025-12-27T10:30:45.123Z",
  "heart_rate_bpm": 88,
  "spo2_percent": 95.7,
  "body_temperature_c": 37.0,
  "movement_g": 0.59,
  "stress_level": 3,
  "blood_glucose_mgdl": 99,
  "sleep_hours": 7.0,
  "noise_exposure_db": 22.8,
  "ambient_light_lux": 406.1,
  "seizure_label": 0,
  "risk_level": "Normal"
}
```

---

### Get Historical Data

Retrieve historical vital signs data for a patient.

**Endpoint:** `GET /api/historical`

**Query Parameters:**
- `patient_id` (optional, default: `patient_1`) - The ID of the patient
- `limit` (optional, default: `100`) - Maximum number of records to return

**Example Request:**
```
GET http://localhost:5000/api/historical?patient_id=patient_1&limit=50
```

**Response:**
```json
{
  "count": 50,
  "data": [
    {
      "patient_id": "patient_1",
      "timestamp": "2025-12-27T10:25:00.000Z",
      "heart_rate_bpm": 87,
      "spo2_percent": 96.2,
      "body_temperature_c": 36.9,
      "movement_g": 0.45,
      "stress_level": 2,
      "blood_glucose_mgdl": 98,
      "sleep_hours": 7.2,
      "noise_exposure_db": 20.5,
      "ambient_light_lux": 380.3,
      "seizure_label": 0,
      "risk_level": "Normal"
    },
    ...
  ]
}
```

---

### Get Alert History

Retrieve a history of high-risk and moderate-risk events.

**Endpoint:** `GET /api/alerts`

**Query Parameters:**
- `patient_id` (optional, default: `patient_1`) - The ID of the patient
- `limit` (optional, default: `50`) - Maximum number of alerts to return

**Example Request:**
```
GET http://localhost:5000/api/alerts?patient_id=patient_1&limit=20
```

**Response:**
```json
{
  "count": 20,
  "alerts": [
    {
      "timestamp": "2025-12-27T10:15:30.000Z",
      "risk_level": "High",
      "heart_rate_bpm": 110,
      "spo2_percent": 92.3,
      "body_temperature_c": 37.5,
      "stress_level": 8
    },
    {
      "timestamp": "2025-12-27T09:45:15.000Z",
      "risk_level": "Moderate",
      "heart_rate_bpm": 95,
      "spo2_percent": 94.1,
      "body_temperature_c": 37.2,
      "stress_level": 6
    },
    ...
  ]
}
```

---

### Get Statistics

Get aggregated risk level statistics for a patient.

**Endpoint:** `GET /api/statistics`

**Query Parameters:**
- `patient_id` (optional, default: `patient_1`) - The ID of the patient
- `days` (optional, default: `7`) - Number of days to include (currently not fully implemented)

**Example Request:**
```
GET http://localhost:5000/api/statistics?patient_id=patient_1
```

**Response:**
```json
{
  "Normal": 850,
  "Moderate": 120,
  "High": 30,
  "total": 1000
}
```

---

### Get Patient List

Retrieve a list of all patients in the system.

**Endpoint:** `GET /api/patients`

**Example Request:**
```
GET http://localhost:5000/api/patients
```

**Response:**
```json
{
  "count": 3,
  "patients": [
    "patient_1",
    "patient_2",
    "patient_3"
  ]
}
```

---

## Data Models

### Vital Signs Data

| Field | Type | Description |
|-------|------|-------------|
| `patient_id` | String | Unique identifier for the patient |
| `timestamp` | DateTime | Timestamp of the reading (ISO 8601 format) |
| `heart_rate_bpm` | Integer | Heart rate in beats per minute |
| `spo2_percent` | Float | Blood oxygen saturation percentage (0-100) |
| `body_temperature_c` | Float | Body temperature in Celsius |
| `movement_g` | Float | Movement intensity in g-force |
| `stress_level` | Integer | Stress level (0-10 scale) |
| `blood_glucose_mgdl` | Integer | Blood glucose in mg/dL |
| `sleep_hours` | Float | Hours of sleep in last 24h |
| `noise_exposure_db` | Float | Ambient noise level in decibels |
| `ambient_light_lux` | Float | Ambient light intensity in lux |
| `seizure_label` | Integer | Seizure occurrence (0 = no, 1 = yes) |
| `risk_level` | String | Seizure risk level: `"Normal"`, `"Moderate"`, or `"High"` |

### Risk Levels

- **Normal**: Low risk, patient vitals within acceptable ranges
- **Moderate**: Elevated risk, monitoring advised
- **High**: Critical risk, immediate attention required

---

## Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `500 Internal Server Error` - Server error (Cassandra connection issues, query failures, etc.)

### Common Errors

#### Internal Server Error (500)
```json
{
  "message": "Internal Server Error",
  "error": "Cassandra query failed: timeout"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Production deployment should include rate limiting to prevent abuse.

---

## CORS

The API currently allows all origins. In production, CORS should be configured to allow only trusted domains.

---

## WebSocket Support (Planned)

Future versions will include WebSocket support for real-time notifications:
- `/ws/vitals` - Real-time vital signs stream
- `/ws/alerts` - Real-time alert notifications

---

## Example Usage

### cURL Examples

**Get latest vitals:**
```bash
curl http://localhost:5000/api/vitals?patient_id=patient_1
```

**Get historical data:**
```bash
curl "http://localhost:5000/api/historical?patient_id=patient_1&limit=100"
```

**Get alert history:**
```bash
curl "http://localhost:5000/api/alerts?patient_id=patient_1&limit=50"
```

### JavaScript/Fetch Examples

```javascript
// Get latest vitals
const response = await fetch('http://localhost:5000/api/vitals?patient_id=patient_1');
const data = await response.json();
console.log(data);

// Get historical data
const historical = await fetch('http://localhost:5000/api/historical?patient_id=patient_1&limit=100');
const histData = await historical.json();
console.log(histData.data);

// Get alerts
const alerts = await fetch('http://localhost:5000/api/alerts?patient_id=patient_1');
const alertData = await alerts.json();
console.log(alertData.alerts);
```

---

## Future Enhancements

- JWT-based authentication
- WebSocket real-time updates
- Rate limiting
- Data export endpoints (CSV, PDF)
- ML prediction confidence scores
- EEG waveform data endpoints
- Patient management (add/update/delete)
- User role-based access control

---

**Last Updated:** December 27, 2025  
**Maintainer:** Manu N M  
**Contact:** PES1PG24CA269@pesu.pes.edu
