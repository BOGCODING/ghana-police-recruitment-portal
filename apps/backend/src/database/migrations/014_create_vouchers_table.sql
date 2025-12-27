-- 014_create_vouchers_table.sql
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "serialNumber" VARCHAR(30),
    "pinCode" VARCHAR(10),
    "isUsed" BOOLEAN DEFAULT FALSE,
    "usedAt" TIMESTAMP,
    "validatedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP NOT NULL,
    "applicantId" UUID REFERENCES applicants(id),
    "generatedBy" UUID REFERENCES admins(id),
    "deactivatedAt" TIMESTAMP,
    "deactivatedBy" UUID REFERENCES admins(id),
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'phone_number') THEN
        ALTER TABLE vouchers RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'serial_number') THEN
        ALTER TABLE vouchers RENAME COLUMN serial_number TO "serialNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'pin_code') THEN
        ALTER TABLE vouchers RENAME COLUMN pin_code TO "pinCode";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'is_used') THEN
        ALTER TABLE vouchers RENAME COLUMN is_used TO "isUsed";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'used_at') THEN
        ALTER TABLE vouchers RENAME COLUMN used_at TO "usedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'validated_at') THEN
        ALTER TABLE vouchers RENAME COLUMN validated_at TO "validatedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'expires_at') THEN
        ALTER TABLE vouchers RENAME COLUMN expires_at TO "expiresAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'applicant_id') THEN
        ALTER TABLE vouchers RENAME COLUMN applicant_id TO "applicantId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'generated_by') THEN
        ALTER TABLE vouchers RENAME COLUMN generated_by TO "generatedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'deactivated_at') THEN
        ALTER TABLE vouchers RENAME COLUMN deactivated_at TO "deactivatedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'deactivated_by') THEN
        ALTER TABLE vouchers RENAME COLUMN deactivated_by TO "deactivatedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'created_at') THEN
        ALTER TABLE vouchers RENAME COLUMN created_at TO "createdAt";
    END IF;
END $$;
