const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const updateBanner = async () => {
  const client = await pool.connect();
  try {
    const bannerConfig = {
      message: 'System Maintenance Scheduled for Tonight',
      type: 'warning',
      show: true
    };
    
    console.log('Setting announcement_banner to', bannerConfig);
    
    await client.query(
      `INSERT INTO system_settings (key, value, "updatedAt")
       VALUES ('announcement_banner', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          "updatedAt" = NOW()`,
      [JSON.stringify(bannerConfig)]
    );
    
    console.log('Successfully updated announcement_banner.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

updateBanner();
