-- 004_create_applications_table.sql
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicantId" UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    "applicationId" VARCHAR(20) UNIQUE,
    status VARCHAR(30) DEFAULT 'DRAFT',
    "currentStep" INTEGER DEFAULT 1,
    category VARCHAR(50),
    "subCategory" VARCHAR(50),
    specialization VARCHAR(100),
    "preferredRegion" VARCHAR(10),
    "alternateRegion" VARCHAR(10),
    "categoryDetails" JSONB,
    declaration JSONB,
    "declarationDate" TIMESTAMP,
    "reviewedBy" UUID REFERENCES admins(id),
    "reviewedAt" TIMESTAMP,
    "reviewComments" TEXT,
    "rejectionReason" TEXT,
    "requiredDocuments" TEXT[],
    "documentRequestMessage" TEXT,
    "submittedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure camelCase columns exist if table already existed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'applicant_id') THEN
        ALTER TABLE applications RENAME COLUMN applicant_id TO "applicantId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'application_id') THEN
        ALTER TABLE applications RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'current_step') THEN
        ALTER TABLE applications RENAME COLUMN current_step TO "currentStep";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'sub_category') THEN
        ALTER TABLE applications RENAME COLUMN sub_category TO "subCategory";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'preferred_region') THEN
        ALTER TABLE applications RENAME COLUMN preferred_region TO "preferredRegion";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'alternate_region') THEN
        ALTER TABLE applications RENAME COLUMN alternate_region TO "alternateRegion";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'category_details') THEN
        ALTER TABLE applications RENAME COLUMN category_details TO "categoryDetails";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'declaration_date') THEN
        ALTER TABLE applications RENAME COLUMN declaration_date TO "declarationDate";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'reviewed_by') THEN
        ALTER TABLE applications RENAME COLUMN reviewed_by TO "reviewedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'reviewed_at') THEN
        ALTER TABLE applications RENAME COLUMN reviewed_at TO "reviewedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'review_comments') THEN
        ALTER TABLE applications RENAME COLUMN review_comments TO "reviewComments";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'rejection_reason') THEN
        ALTER TABLE applications RENAME COLUMN rejection_reason TO "rejectionReason";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'required_documents') THEN
        ALTER TABLE applications RENAME COLUMN required_documents TO "requiredDocuments";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'document_request_message') THEN
        ALTER TABLE applications RENAME COLUMN document_request_message TO "documentRequestMessage";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'submitted_at') THEN
        ALTER TABLE applications RENAME COLUMN submitted_at TO "submittedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'created_at') THEN
        ALTER TABLE applications RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'updated_at') THEN
        ALTER TABLE applications RENAME COLUMN updated_at TO "updatedAt";
    END IF;
END $$;
