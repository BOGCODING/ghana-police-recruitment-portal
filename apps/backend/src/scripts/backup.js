const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Perform a database backup using pg_dump
 */
const backupDatabase = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logger.error('DATABASE_URL not found in environment');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  
  // Mask password for logging
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  logger.info(`Starting database backup from ${maskedUrl} to ${backupFile}...`);

  // Use pg_dump if available on the system
  const command = `pg_dump "${dbUrl}" > "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Backup failed: ${error.message}`);
      return;
    }
    if (stderr) {
      logger.warn(`Backup stderr: ${stderr}`);
    }
    logger.info(`Backup successful: ${backupFile}`);
    
    // Cleanup old backups (keep last 7 days)
    cleanupOldBackups(backupDir);
  });
};

const cleanupOldBackups = (dir) => {
  const files = fs.readdirSync(dir);
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old backup: ${file}`);
    }
  });
};

// Run backup if called directly
if (require.main === module) {
  backupDatabase();
}

module.exports = backupDatabase;
