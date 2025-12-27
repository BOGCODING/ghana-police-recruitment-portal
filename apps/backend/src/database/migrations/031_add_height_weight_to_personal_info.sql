-- Add height and weight columns to personal_info
ALTER TABLE personal_info 
ADD COLUMN IF NOT EXISTS "heightCm" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "weightKg" DECIMAL(5,2);
