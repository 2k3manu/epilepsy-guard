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
VALUES ('aditya_k', '$2b$10$FvAcwd49jTqmjxjq8HWLqO5NrKaunuXM1vcOm/deqWC.Uwfqo9Za2', 'Dr. Aditya Kulkarni', 'doctor', toTimestamp(now()));

INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('rohan_g', '$2b$10$FvAcwd49jTqmjxjq8HWLqO5NrKaunuXM1vcOm/deqWC.Uwfqo9Za2', 'Rohan Gupta', 'caregiver', toTimestamp(now()));

// Patient Users (Password: admin123)
INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('arjun_s', '$2b$10$FvAcwd49jTqmjxjq8HWLqO5NrKaunuXM1vcOm/deqWC.Uwfqo9Za2', 'Arjun Sharma', 'patient', toTimestamp(now()));

INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('priya_l', '$2b$10$FvAcwd49jTqmjxjq8HWLqO5NrKaunuXM1vcOm/deqWC.Uwfqo9Za2', 'Priya Lakshmi', 'patient', toTimestamp(now()));

INSERT INTO users (username, password_hash, full_name, role, created_at) 
VALUES ('ishaan_v', '$2b$10$FvAcwd49jTqmjxjq8HWLqO5NrKaunuXM1vcOm/deqWC.Uwfqo9Za2', 'Ishaan Verma', 'patient', toTimestamp(now()));
