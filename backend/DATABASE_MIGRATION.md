# Database Migration Guide

## Issue: Role Enum Column Type

The `users.role` column was created as a MySQL ENUM type with old values (`ORGANIZER`, `VENDOR`, `PARTICIPANT`, `ADMIN`), but the code now uses new values (`ADMIN`, `ORGANIZER`, `ATTENDEE`).

## Solution

### Option 1: Manual SQL Update (Recommended for existing databases)

Run this SQL script in your MySQL database:

```sql
-- Convert ENUM to VARCHAR to allow Hibernate to manage it
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ATTENDEE';

-- Update existing data
UPDATE users SET role = 'ATTENDEE' WHERE role = 'PARTICIPANT';
UPDATE users SET role = 'ORGANIZER' WHERE role = 'VENDOR';
-- ADMIN and ORGANIZER remain unchanged
```

### Option 2: Drop and Recreate Database (For development only)

If you're in development and can afford to lose data:

1. Drop the database:
   ```sql
   DROP DATABASE event_management_db;
   ```

2. Restart the Spring Boot application - it will recreate the database with the correct schema.

### Option 3: Use Hibernate ddl-auto: create-drop

**WARNING: This will delete all data!**

Change `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
```

Then restart the application. After first run, change it back to `update`.

## Verification

After running the migration, verify the column type:

```sql
DESCRIBE users;
-- or
SHOW COLUMNS FROM users LIKE 'role';
```

The `role` column should be `VARCHAR(20)` or `varchar(20)`, not `ENUM(...)`.

## Testing

After migration, test registration:
1. Try registering as ORGANIZER - should work
2. Try registering as ATTENDEE - should work  
3. Try registering as ADMIN - should be rejected (as expected)
