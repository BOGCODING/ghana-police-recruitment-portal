-- 030_add_missing_personal_info_columns.sql
DO $$ 
BEGIN 
    -- Add ghanaCardNumber
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'ghanaCardNumber') THEN
        ALTER TABLE personal_info ADD COLUMN "ghanaCardNumber" VARCHAR(20);
    END IF;

    -- Add heightCm
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'heightCm') THEN
        ALTER TABLE personal_info ADD COLUMN "heightCm" INTEGER;
    END IF;

    -- Add weightKg
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'weightKg') THEN
        ALTER TABLE personal_info ADD COLUMN "weightKg" DECIMAL(5,2);
    END IF;

    -- Add nationality (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'nationality') THEN
        ALTER TABLE personal_info ADD COLUMN "nationality" VARCHAR(30) DEFAULT 'GHANAIAN';
    END IF;

    -- Add religion and tribe if they were somehow missed or renamed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'religion') THEN
        ALTER TABLE personal_info ADD COLUMN "religion" VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal_info' AND column_name = 'tribe') THEN
        ALTER TABLE personal_info ADD COLUMN "tribe" VARCHAR(50);
    END IF;

END $$;
