-- 029_create_application_notes_table.sql
-- Create application_notes table for internal admin notes

CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "adminId" UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "isPrivate" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_application_notes_app_id ON application_notes("applicationId");
CREATE INDEX IF NOT EXISTS idx_application_notes_admin_id ON application_notes("adminId");
CREATE INDEX IF NOT EXISTS idx_application_notes_created ON application_notes("createdAt" DESC);
