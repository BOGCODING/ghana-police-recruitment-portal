const { query } = require('./src/config/database');
require('dotenv').config();

async function checkSchema() {
  try {
    console.log('--- Database Schema Check ---');
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'personal_info'
      ORDER BY column_name;
    `);
    
    console.log('Columns in personal_info:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\nAll tables:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Schema check failed:', error);
    process.exit(1);
  }
}

checkSchema();
