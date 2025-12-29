require('dotenv').config();
const { query } = require('./src/config/database');

async function listDocs() {
  try {
    console.log('--- Document Table Check ---');
    const apps = await query('SELECT id, "applicantId", "applicationId" FROM applications LIMIT 5');
    console.log('--- Applications ---');
    console.log(JSON.stringify(apps.rows, null, 2));

    const docs = await query(`
      SELECT "applicationId", "documentType", "filePath", "originalName"
      FROM documents
      ORDER BY "createdAt" DESC
      LIMIT 20;
    `);
    console.log('--- Documents ---');
    console.log(JSON.stringify(docs.rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

listDocs();
