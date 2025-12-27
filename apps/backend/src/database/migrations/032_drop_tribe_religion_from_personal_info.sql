-- 032_drop_tribe_religion_from_personal_info.sql
-- Migration to remove orphan columns from personal_info table

-- 1. Drop the columns if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'religion') THEN
        ALTER TABLE personal_info DROP COLUMN religion;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'tribe') THEN
        ALTER TABLE personal_info DROP COLUMN tribe;
    END IF;
END $$;
