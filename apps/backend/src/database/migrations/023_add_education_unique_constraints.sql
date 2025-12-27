-- 023_add_education_unique_constraints.sql
-- Add unique constraints required for ON CONFLICT (upsert) operations in EducationModel
-- Safe: only add if constraint doesn't exist

DO $$
BEGIN
    -- 1. BECE Results: One record per application
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bece_results_application_id_key') THEN
        ALTER TABLE bece_results ADD CONSTRAINT bece_results_application_id_key UNIQUE ("applicationId");
    END IF;

    -- 2. WASSCE Results: One record per application per type (Regular vs NovDec)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wassce_results_app_id_novdec_key') THEN
        ALTER TABLE wassce_results ADD CONSTRAINT wassce_results_app_id_novdec_key UNIQUE ("applicationId", "isNovdec");
    END IF;

    -- 3. Tertiary Education: One record per application for this implementation
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tertiary_education_application_id_key') THEN
        ALTER TABLE tertiary_education ADD CONSTRAINT tertiary_education_application_id_key UNIQUE ("applicationId");
    END IF;
END $$;
