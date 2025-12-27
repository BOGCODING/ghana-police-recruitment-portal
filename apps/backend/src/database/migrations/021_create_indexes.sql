-- 021_create_indexes.sql
-- Safe index creation: only create if column exists

DO $$
BEGIN
    -- Applicants indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='email') THEN
        CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='serialNumber') THEN
        CREATE INDEX IF NOT EXISTS idx_applicants_serial ON applicants("serialNumber");
    END IF;
    
    -- Vouchers indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='code') THEN
        CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='email') THEN
        CREATE INDEX IF NOT EXISTS idx_vouchers_email ON vouchers(email);
    END IF;
    
    -- Applications indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='status') THEN
        CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='category') THEN
        CREATE INDEX IF NOT EXISTS idx_applications_category ON applications(category);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='preferredRegion') THEN
        CREATE INDEX IF NOT EXISTS idx_applications_region ON applications("preferredRegion");
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='applicantId') THEN
        CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications("applicantId");
    END IF;
    
    -- Audit logs indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='action') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='userId') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs("userId");
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='createdAt') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs("createdAt");
    END IF;
    
    -- Notifications indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='userId') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
    END IF;
    
    -- Admins indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='email') THEN
        CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    END IF;
    
    -- Documents indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='applicationId') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_app ON documents("applicationId");
    END IF;
END $$;
