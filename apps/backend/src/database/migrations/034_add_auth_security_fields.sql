-- 034_add_auth_security_fields.sql
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER DEFAULT 0;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS "lockUntil" TIMESTAMP;

ALTER TABLE admins ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS "lockUntil" TIMESTAMP;

-- Create indexes for performance if we frequently query these
CREATE INDEX IF NOT EXISTS idx_applicants_login_attempts ON applicants("loginAttempts") WHERE "loginAttempts" > 0;
CREATE INDEX IF NOT EXISTS idx_admins_login_attempts ON admins("loginAttempts") WHERE "loginAttempts" > 0;
