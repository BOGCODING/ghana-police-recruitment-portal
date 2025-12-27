const { query } = require('../config/database');
const crypto = require('crypto');

/**
 * Utility to generate unique, human-readable application IDs
 * Format: GPS-YYYY-XXXXXXXXXX (e.g., GPS-2025-X7R2A9B4V3)
 */
const applicationIdGenerator = {
  /**
   * Generate a unique alphanumeric application ID
   * @returns {Promise<string>}
   */
  async generate() {
    const year = new Date().getFullYear();
    const prefix = `GPS-${year}-`;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid O, I, 0, 1 for clarity
    
    let isUnique = false;
    let appId = '';
    
    while (!isUnique) {
      // Generate 10 random characters
      let suffix = '';
      const bytes = crypto.randomBytes(10);
      for (let i = 0; i < 10; i++) {
        suffix += chars[bytes[i] % chars.length];
      }
      
      appId = `${prefix}${suffix}`;
      
      // Check for collision - highly unlikely but safe
      const result = await query(
        'SELECT 1 FROM applications WHERE "applicationId" = $1 LIMIT 1',
        [appId]
      );
      
      if (result.rows.length === 0) {
        isUnique = true;
      }
    }
    
    return appId;
  },

  /**
   * Parse an application ID to get its parts
   * @param {string} id 
   * @returns {Object|null}
   */
  parse(id) {
    const regex = /^GPS-(\d{4})-([A-Z2-9]{10})$/;
    const match = id.match(regex);
    
    if (!match) return null;
    
    return {
      prefix: 'GPS',
      year: parseInt(match[1]),
      suffix: match[2]
    };
  }
};

module.exports = applicationIdGenerator;
