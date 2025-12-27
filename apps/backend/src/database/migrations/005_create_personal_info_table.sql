-- 005_create_personal_info_table.sql
CREATE TABLE IF NOT EXISTS personal_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "middleName" VARCHAR(50),
    "dateOfBirth" DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    "maritalStatus" VARCHAR(20),
    nationality VARCHAR(30) DEFAULT 'GHANAIAN',
    hometown VARCHAR(100),
    district VARCHAR(100),
    region VARCHAR(10),
    religion VARCHAR(50),
    tribe VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'applicant_id') THEN
        ALTER TABLE personal_info RENAME COLUMN applicant_id TO "applicantId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'application_id') THEN
        ALTER TABLE personal_info RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'first_name') THEN
        ALTER TABLE personal_info RENAME COLUMN first_name TO "firstName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'last_name') THEN
        ALTER TABLE personal_info RENAME COLUMN last_name TO "lastName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'middle_name') THEN
        ALTER TABLE personal_info RENAME COLUMN middle_name TO "middleName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'date_of_birth') THEN
        ALTER TABLE personal_info RENAME COLUMN date_of_birth TO "dateOfBirth";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'marital_status') THEN
        ALTER TABLE personal_info RENAME COLUMN marital_status TO "maritalStatus";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'created_at') THEN
        ALTER TABLE personal_info RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'updated_at') THEN
        ALTER TABLE personal_info RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
