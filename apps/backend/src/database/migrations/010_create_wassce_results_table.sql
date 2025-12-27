-- 010_create_wassce_results_table.sql
CREATE TABLE IF NOT EXISTS wassce_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "isNovdec" BOOLEAN DEFAULT FALSE,
    "schoolName" VARCHAR(200),
    "completionYear" INTEGER,
    "indexNumber" VARCHAR(50),
    results JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'application_id') THEN
        ALTER TABLE wassce_results RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'is_novdec') THEN
        ALTER TABLE wassce_results RENAME COLUMN is_novdec TO "isNovdec";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'school_name') THEN
        ALTER TABLE wassce_results RENAME COLUMN school_name TO "schoolName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'completion_year') THEN
        ALTER TABLE wassce_results RENAME COLUMN completion_year TO "completionYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'index_number') THEN
        ALTER TABLE wassce_results RENAME COLUMN index_number TO "indexNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'created_at') THEN
        ALTER TABLE wassce_results RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wassce_results' AND column_name = 'updated_at') THEN
        ALTER TABLE wassce_results RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
