-- 011_create_tertiary_education_table.sql
CREATE TABLE IF NOT EXISTS tertiary_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "institutionName" VARCHAR(200),
    qualification VARCHAR(20),
    "courseOfStudy" VARCHAR(200),
    "classObtained" VARCHAR(20),
    "completionYear" INTEGER,
    "certificateNumber" VARCHAR(100),
    "nationalServiceYear" INTEGER,
    "nationalServiceNumber" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'application_id') THEN
        ALTER TABLE tertiary_education RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'institution_name') THEN
        ALTER TABLE tertiary_education RENAME COLUMN institution_name TO "institutionName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'course_of_study') THEN
        ALTER TABLE tertiary_education RENAME COLUMN course_of_study TO "courseOfStudy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'class_obtained') THEN
        ALTER TABLE tertiary_education RENAME COLUMN class_obtained TO "classObtained";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'completion_year') THEN
        ALTER TABLE tertiary_education RENAME COLUMN completion_year TO "completionYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'certificate_number') THEN
        ALTER TABLE tertiary_education RENAME COLUMN certificate_number TO "certificateNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'national_service_year') THEN
        ALTER TABLE tertiary_education RENAME COLUMN national_service_year TO "nationalServiceYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'national_service_number') THEN
        ALTER TABLE tertiary_education RENAME COLUMN national_service_number TO "nationalServiceNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'created_at') THEN
        ALTER TABLE tertiary_education RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tertiary_education' AND column_name = 'updated_at') THEN
        ALTER TABLE tertiary_education RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
