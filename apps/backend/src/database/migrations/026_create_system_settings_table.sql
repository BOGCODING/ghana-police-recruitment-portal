-- 026_create_system_settings_table.sql
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID REFERENCES admins(id)
);

-- Seed initial voucher price
INSERT INTO system_settings (key, value, description)
VALUES ('voucher_price', '100', 'The price of a recruitment voucher in Ghana Cedis (GHS)')
ON CONFLICT (key) DO NOTHING;
