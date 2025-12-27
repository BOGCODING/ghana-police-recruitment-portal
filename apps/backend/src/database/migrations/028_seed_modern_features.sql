INSERT INTO system_settings (key, value, "updatedAt")
VALUES 
  ('announcement_banner', '{"message": "Welcome to the portal!", "type": "info", "show": false}', NOW()),
  ('allow_new_registrations', 'true', NOW()),
  ('enable_email_notifications', 'true', NOW())
ON CONFLICT (key) DO NOTHING;
