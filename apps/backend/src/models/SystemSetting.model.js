const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * SystemSetting Model - Handles system-wide configurations
 */
const SystemSetting = {
  /**
   * Get a setting by key
   * @param {string} key 
   * @returns {Promise<any>} The setting value
   */
  async get(key) {
    try {
      const result = await query(
        'SELECT value FROM system_settings WHERE key = $1',
        [key]
      );
      
      if (result.rows.length === 0) return null;
      
      return result.rows[0].value;
    } catch (error) {
      logger.error(`Error fetching system setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set or update a system setting
   * @param {string} key 
   * @param {any} value 
   * @param {string} adminId 
   * @returns {Promise<void>}
   */
  async upsert(key, value, adminId) {
    try {
      await query(
        `INSERT INTO system_settings (key, value, "updatedAt", "updatedBy")
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            "updatedAt" = NOW(),
            "updatedBy" = EXCLUDED."updatedBy"`,
        [key, JSON.stringify(value), adminId]
      );
    } catch (error) {
      logger.error(`Error updating system setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all settings
   * @returns {Promise<Object>}
   */
  async getAll() {
    try {
      const result = await query('SELECT key, value, description FROM system_settings');
      return result.rows;
    } catch (error) {
      logger.error('Error fetching all system settings:', error);
      throw error;
    }
  }
};

module.exports = SystemSetting;
