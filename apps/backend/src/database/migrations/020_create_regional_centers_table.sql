-- 020_create_regional_centers_table.sql
CREATE TABLE IF NOT EXISTS regional_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,
    location VARCHAR(200),
    "contactInfo" JSONB,
    capacity INTEGER,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'regional_centers' AND column_name = 'region_code') THEN
        ALTER TABLE regional_centers RENAME COLUMN region_code TO "regionCode";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'regional_centers' AND column_name = 'contact_info') THEN
        ALTER TABLE regional_centers RENAME COLUMN contact_info TO "contactInfo";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'regional_centers' AND column_name = 'is_active') THEN
        ALTER TABLE regional_centers RENAME COLUMN is_active TO "isActive";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'regional_centers' AND column_name = 'created_at') THEN
        ALTER TABLE regional_centers RENAME COLUMN created_at TO "createdAt";
    END IF;
END $$;
