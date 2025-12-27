-- Seed additional system settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('recruitment_status', '"OPEN"', 'Current status of the recruitment process (OPEN, CLOSED, PAUSED)'),
    ('application_deadline', '"2026-12-31T23:59:59Z"', 'The cutoff date and time for new applications'),
    ('maintenance_mode', 'false', 'Enable to prevent all public access to the portal'),
    ('contact_email', '"support@gpsrecruitment.gov.gh"', 'Official support email displayed on the portal'),
    ('contact_phone', '"+233 30 277 3906"', 'Official support phone number displayed on the portal')
ON CONFLICT (key) DO NOTHING;
