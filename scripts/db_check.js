const { query } = require('./apps/backend/src/config/database');
require('dotenv').config({ path: './apps/backend/.env' });

async function checkApplicants() {
  try {
    const result = await query('SELECT email, status, "lastLogin" FROM applicants ORDER BY "createdAt" DESC LIMIT 10');
    console.log('Recent Applicants:');
    console.table(result.rows);
    
    const vouchers = await query('SELECT "serialNumber", "isUsed", "expiresAt" FROM vouchers WHERE "isUsed" = false LIMIT 5');
    console.log('Available Vouchers:');
    console.table(vouchers.rows);
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    process.exit();
  }
}

checkApplicants();
