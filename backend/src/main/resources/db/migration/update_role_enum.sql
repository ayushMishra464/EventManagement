-- Migration script to update user role enum values
-- Run this script manually if Hibernate ddl-auto doesn't update the enum

-- Option 1: Alter the ENUM column (if using ENUM type)
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'ORGANIZER', 'ATTENDEE') NOT NULL DEFAULT 'ATTENDEE';

-- Option 2: If the above doesn't work, convert to VARCHAR and let Hibernate handle it
-- ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ATTENDEE';

-- Update existing data
UPDATE users SET role = 'ATTENDEE' WHERE role = 'PARTICIPANT';
UPDATE users SET role = 'ORGANIZER' WHERE role = 'VENDOR';
-- Keep ADMIN and ORGANIZER as is
