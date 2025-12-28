-- 001_create_users_table.sql
-- Note: In this system, 'users' primarily refers to applicants for portal access.
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "userType" VARCHAR(20) NOT NULL DEFAULT 'applicant',
    "isActive" BOOLEAN DEFAULT TRUE,
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed (Commented out for fresh deploy)
/*
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    -- ... (rest of renames)
END $$;
*/
