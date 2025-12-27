-- 022_seed_data.sql
-- Seed Roles
INSERT INTO roles (name, description) VALUES 
('SUPER_ADMIN', 'Access to all systems'),
('MODERATOR', 'Manage applications and review documents'),
('VIEWER', 'View data and reports only'),
('VOUCHER_MANAGER', 'Issue and manage vouchers'),
('REGIONAL_ADMIN', 'Manage regional center data')
ON CONFLICT (name) DO NOTHING;

-- Seed Regional Centers
INSERT INTO regional_centers (name, "regionCode", location) VALUES 
('Greater Accra Regional Headquarters', 'GA', 'Accra'),
('Ashanti Regional HQ', 'AS', 'Kumasi'),
('Northern Regional HQ', 'NR', 'Tamale'),
('Western Regional HQ', 'WR', 'Sekondi-Takoradi')
ON CONFLICT DO NOTHING;
