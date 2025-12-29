-- 031_relax_audit_logs_entity_id.sql
-- Relax entityId from UUID to VARCHAR to support non-UUID identifiers like system setting keys

DO $$ 
BEGIN 
    -- Change column type to VARCHAR(100)
    -- Using USING "entityId"::text to ensure existing UUIDs are converted correctly
    ALTER TABLE audit_logs ALTER COLUMN "entityId" TYPE VARCHAR(100) USING "entityId"::text;
    
    RAISE NOTICE 'Changed audit_logs.entityId type to VARCHAR(100)';
END $$;
