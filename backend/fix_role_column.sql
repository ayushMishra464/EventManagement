-- Quick fix: Update the role column to support new enum values
-- Run this in your MySQL database

USE event_management_db;

-- Convert ENUM to VARCHAR (allows any string value)
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ATTENDEE';

-- Update existing data to new role values
UPDATE users SET role = 'ATTENDEE' WHERE role = 'PARTICIPANT';
UPDATE users SET role = 'ORGANIZER' WHERE role = 'VENDOR';
-- ADMIN and ORGANIZER values remain unchanged

-- Verify the change
DESCRIBE users;
