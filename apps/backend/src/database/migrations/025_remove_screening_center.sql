-- 025_remove_screening_center.sql
-- Remove screeningCenter column from personal_info table

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'screeningCenter') THEN
        ALTER TABLE personal_info DROP COLUMN "screeningCenter";
    END IF;
    
    -- Also check for snake_case version just in case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'screening_center') THEN
        ALTER TABLE personal_info DROP COLUMN screening_center;
    END IF;
END $$;
