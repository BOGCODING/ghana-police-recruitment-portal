-- 007_create_physical_attributes_table.sql
CREATE TABLE IF NOT EXISTS physical_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "heightCm" INTEGER,
    "weightKg" DECIMAL(5,2),
    "eyeColor" VARCHAR(20),
    "hairColor" VARCHAR(20),
    "complexion" VARCHAR(20),
    "bodyMarks" TEXT,
    "bloodGroup" VARCHAR(5),
    "hasDisability" BOOLEAN DEFAULT FALSE,
    "disabilityDetails" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'application_id') THEN
        ALTER TABLE physical_attributes RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'height_cm') THEN
        ALTER TABLE physical_attributes RENAME COLUMN height_cm TO "heightCm";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'weight_kg') THEN
        ALTER TABLE physical_attributes RENAME COLUMN weight_kg TO "weightKg";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'eye_color') THEN
        ALTER TABLE physical_attributes RENAME COLUMN eye_color TO "eyeColor";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'hair_color') THEN
        ALTER TABLE physical_attributes RENAME COLUMN hair_color TO "hairColor";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'body_marks') THEN
        ALTER TABLE physical_attributes RENAME COLUMN body_marks TO "bodyMarks";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'blood_group') THEN
        ALTER TABLE physical_attributes RENAME COLUMN blood_group TO "bloodGroup";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'has_disability') THEN
        ALTER TABLE physical_attributes RENAME COLUMN has_disability TO "hasDisability";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'disability_details') THEN
        ALTER TABLE physical_attributes RENAME COLUMN disability_details TO "disabilityDetails";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'created_at') THEN
        ALTER TABLE physical_attributes RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'physical_attributes' AND column_name = 'updated_at') THEN
        ALTER TABLE physical_attributes RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
