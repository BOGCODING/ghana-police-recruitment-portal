-- 002_create_admins_table.sql
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'VIEWER',
    "assignedRegions" TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT TRUE,
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'password_hash') THEN
        ALTER TABLE admins RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'first_name') THEN
        ALTER TABLE admins RENAME COLUMN first_name TO "firstName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'last_name') THEN
        ALTER TABLE admins RENAME COLUMN last_name TO "lastName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'assigned_regions') THEN
        ALTER TABLE admins RENAME COLUMN assigned_regions TO "assignedRegions";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'is_active') THEN
        ALTER TABLE admins RENAME COLUMN is_active TO "isActive";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'last_login') THEN
        ALTER TABLE admins RENAME COLUMN last_login TO "lastLogin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'created_at') THEN
        ALTER TABLE admins RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'updated_at') THEN
        ALTER TABLE admins RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
