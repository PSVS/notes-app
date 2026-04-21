-- Create database
CREATE DATABASE notes_db;

-- Connect to the database
\c notes_db;

-- Create user (optional, adjust as needed)
-- CREATE USER notes_user WITH PASSWORD 'your_password_here';

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE notes_db TO notes_user;

-- Create notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);