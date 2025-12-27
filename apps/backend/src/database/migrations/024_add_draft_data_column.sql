-- 024_add_draft_data_column.sql
-- Add draftData column to store auto-save data when Redis is unavailable
ALTER TABLE applications ADD COLUMN IF NOT EXISTS "draftData" JSONB DEFAULT '{}';
