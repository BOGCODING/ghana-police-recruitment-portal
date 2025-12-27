-- 006_create_contact_info_table.sql
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "alternatePhone" VARCHAR(20),
    "residentialAddress" TEXT,
    "postalAddress" TEXT,
    "digitalAddress" VARCHAR(20),
    "emergencyContactName" VARCHAR(100),
    "emergencyContactPhone" VARCHAR(20),
    "emergencyContactRelation" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'application_id') THEN
        ALTER TABLE contact_info RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'phone_number') THEN
        ALTER TABLE contact_info RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'alternate_phone') THEN
        ALTER TABLE contact_info RENAME COLUMN alternate_phone TO "alternatePhone";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'residential_address') THEN
        ALTER TABLE contact_info RENAME COLUMN residential_address TO "residentialAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'postal_address') THEN
        ALTER TABLE contact_info RENAME COLUMN postal_address TO "postalAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'digital_address') THEN
        ALTER TABLE contact_info RENAME COLUMN digital_address TO "digitalAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_name TO "emergencyContactName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_phone TO "emergencyContactPhone";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'emergency_contact_relation') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_relation TO "emergencyContactRelation";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'created_at') THEN
        ALTER TABLE contact_info RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'updated_at') THEN
        ALTER TABLE contact_info RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
