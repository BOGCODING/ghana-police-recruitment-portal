-- 008_create_education_table.sql
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "hasWassce" BOOLEAN DEFAULT TRUE,
    "hasNovDec" BOOLEAN DEFAULT FALSE,
    "hasTertiary" BOOLEAN DEFAULT FALSE,
    "hasProfessionalCert" BOOLEAN DEFAULT FALSE,
    "hasCompletedNationalService" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'application_id') THEN
        ALTER TABLE education RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'has_wassce') THEN
        ALTER TABLE education RENAME COLUMN has_wassce TO "hasWassce";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'has_novdec') THEN
        ALTER TABLE education RENAME COLUMN has_novdec TO "hasNovDec";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'has_tertiary') THEN
        ALTER TABLE education RENAME COLUMN has_tertiary TO "hasTertiary";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'has_professional_cert') THEN
        ALTER TABLE education RENAME COLUMN has_professional_cert TO "hasProfessionalCert";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'has_completed_national_service') THEN
        ALTER TABLE education RENAME COLUMN has_completed_national_service TO "hasCompletedNationalService";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'created_at') THEN
        ALTER TABLE education RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'updated_at') THEN
        ALTER TABLE education RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
