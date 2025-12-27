-- 012_create_employment_history_table.sql
CREATE TABLE IF NOT EXISTS employment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "employerName" VARCHAR(200) NOT NULL,
    "positionHeld" VARCHAR(100) NOT NULL,
    "dateFrom" DATE NOT NULL,
    "dateTo" DATE,
    "reasonForLeaving" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'application_id') THEN
        ALTER TABLE employment_history RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'employer_name') THEN
        ALTER TABLE employment_history RENAME COLUMN employer_name TO "employerName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'position_held') THEN
        ALTER TABLE employment_history RENAME COLUMN position_held TO "positionHeld";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'date_from') THEN
        ALTER TABLE employment_history RENAME COLUMN date_from TO "dateFrom";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'date_to') THEN
        ALTER TABLE employment_history RENAME COLUMN date_to TO "dateTo";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'reason_for_leaving') THEN
        ALTER TABLE employment_history RENAME COLUMN reason_for_leaving TO "reasonForLeaving";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'created_at') THEN
        ALTER TABLE employment_history RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employment_history' AND column_name = 'updated_at') THEN
        ALTER TABLE employment_history RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
