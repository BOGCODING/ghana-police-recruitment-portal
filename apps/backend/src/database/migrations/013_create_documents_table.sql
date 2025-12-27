-- 013_create_documents_table.sql
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "documentType" VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255),
    "filePath" TEXT NOT NULL,
    "mimeType" VARCHAR(50),
    "fileSize" INTEGER,
    description TEXT,
    "verificationStatus" VARCHAR(20) DEFAULT 'PENDING',
    "verifiedBy" UUID REFERENCES admins(id),
    "verifiedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'application_id') THEN
        ALTER TABLE documents RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'document_type') THEN
        ALTER TABLE documents RENAME COLUMN document_type TO "documentType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'original_name') THEN
        ALTER TABLE documents RENAME COLUMN original_name TO "originalName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_path') THEN
        ALTER TABLE documents RENAME COLUMN file_path TO "filePath";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'mime_type') THEN
        ALTER TABLE documents RENAME COLUMN mime_type TO "mimeType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_size') THEN
        ALTER TABLE documents RENAME COLUMN file_size TO "fileSize";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'verification_status') THEN
        ALTER TABLE documents RENAME COLUMN verification_status TO "verificationStatus";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'verified_by') THEN
        ALTER TABLE documents RENAME COLUMN verified_by TO "verifiedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'verified_at') THEN
        ALTER TABLE documents RENAME COLUMN verified_at TO "verifiedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at') THEN
        ALTER TABLE documents RENAME COLUMN created_at TO "createdAt";
    END IF;
END $$;
