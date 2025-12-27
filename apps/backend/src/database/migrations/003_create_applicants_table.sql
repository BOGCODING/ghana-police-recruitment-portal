-- 003_create_applicants_table.sql
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "serialNumber" VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'REGISTERED',
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "emailVerificationToken" VARCHAR(255),
    "resetToken" VARCHAR(255),
    "resetTokenExpires" TIMESTAMP,
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'serial_number') THEN
        ALTER TABLE applicants RENAME COLUMN serial_number TO "serialNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'phone_number') THEN
        ALTER TABLE applicants RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'password_hash') THEN
        ALTER TABLE applicants RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'email_verified') THEN
        ALTER TABLE applicants RENAME COLUMN email_verified TO "emailVerified";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'email_verification_token') THEN
        ALTER TABLE applicants RENAME COLUMN email_verification_token TO "emailVerificationToken";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'reset_token') THEN
        ALTER TABLE applicants RENAME COLUMN reset_token TO "resetToken";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'reset_token_expires') THEN
        ALTER TABLE applicants RENAME COLUMN reset_token_expires TO "resetTokenExpires";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'last_login') THEN
        ALTER TABLE applicants RENAME COLUMN last_login TO "lastLogin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'created_at') THEN
        ALTER TABLE applicants RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'updated_at') THEN
        ALTER TABLE applicants RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
