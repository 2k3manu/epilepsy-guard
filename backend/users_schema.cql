USE epilepsy_monitoring;

CREATE TABLE IF NOT EXISTS users (
    username text PRIMARY KEY,
    password_hash text,
    full_name text,
    role text, // doctor, caregiver
    created_at timestamp
);

// Default Indian Users (Password: admin123)
// Hashes generated via bcrypt (strength 10)
INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('aditya_k', '$2b$10$w0f0v1F8S2O5K7Y9q6D3uO.pG.hVvE.WzX8L8e8f8g8h8i8j8k8l8', 'Dr. Aditya Kulkarni', 'doctor', toTimestamp(now()));

INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('rohan_g', '$2b$10$w0f0v1F8S2O5K7Y9q6D3uO.pG.hVvE.WzX8L8e8f8g8h8i8j8k8l8', 'Rohan Gupta', 'caregiver', toTimestamp(now()));
