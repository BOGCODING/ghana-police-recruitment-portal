-- 016_create_audit_logs_table.sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(30) NOT NULL,
    "entityId" UUID,
    "userId" UUID,
    "userType" VARCHAR(20),
    details JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type') THEN
        ALTER TABLE audit_logs RENAME COLUMN entity_type TO "entityType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_id') THEN
        ALTER TABLE audit_logs RENAME COLUMN entity_id TO "entityId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_id TO "userId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_type') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_type TO "userType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE audit_logs RENAME COLUMN ip_address TO "ipAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_agent TO "userAgent";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'created_at') THEN
        ALTER TABLE audit_logs RENAME COLUMN created_at TO "createdAt";
    END IF;
END $$;
