const { query } = require('../config/database');

/**
 * EmploymentHistory Model - Handles all database operations for employment history
 */
const EmploymentHistoryModel = {
  /**
   * Find employment history by application ID
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Array>} Array of employment records
   */
  async findByApplicationId(applicationId) {
    const result = await query(
      'SELECT * FROM employment_history WHERE "applicationId" = $1 ORDER BY "dateFrom" DESC',
      [applicationId]
    );
    return result.rows;
  },

  /**
   * Create a new employment history record
   * @param {Object} data - Employment data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const {
      applicationId,
      employerName,
      positionHeld,
      dateFrom,
      dateTo = null,
      reasonForLeaving = null
    } = data;

    const result = await query(
      `INSERT INTO employment_history 
       ("applicationId", "employerName", "positionHeld", "dateFrom", "dateTo", "reasonForLeaving")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [applicationId, employerName, positionHeld, dateFrom, dateTo, reasonForLeaving]
    );
    return result.rows[0];
  },

  /**
   * Create employment record with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} data - Employment data
   * @returns {Promise<Object>} Created record
   */
  async createWithClient(client, data) {
    const {
      applicationId,
      employerName,
      positionHeld,
      dateFrom,
      dateTo = null,
      reasonForLeaving = null
    } = data;

    const result = await client.query(
      `INSERT INTO employment_history 
       ("applicationId", "employerName", "positionHeld", "dateFrom", "dateTo", "reasonForLeaving")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [applicationId, employerName, positionHeld, dateFrom, dateTo, reasonForLeaving]
    );
    return result.rows[0];
  },

  /**
   * Delete all employment records for an application
   * @param {string} applicationId - Application UUID
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteByApplicationId(applicationId) {
    const result = await query(
      'DELETE FROM employment_history WHERE "applicationId" = $1 RETURNING id',
      [applicationId]
    );
    return result.rows.length;
  },

  /**
   * Delete employment record with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteByApplicationIdWithClient(client, applicationId) {
    const result = await client.query(
      'DELETE FROM employment_history WHERE "applicationId" = $1 RETURNING id',
      [applicationId]
    );
    return result.rows.length;
  },

  /**
   * Save full employment history (Delete existing and create new)
   * @param {string} applicationId - Application UUID
   * @param {Array} employmentRecords - Array of employment records
   * @param {Object} client - Transaction client
   * @returns {Promise<Array>} Created records
   */
  async saveFullHistoryWithClient(client, applicationId, employmentRecords) {
    // Delete existing
    await this.deleteByApplicationIdWithClient(client, applicationId);

    // Create new records
    const results = [];
    if (employmentRecords && employmentRecords.length > 0) {
      for (const record of employmentRecords) {
        const result = await this.createWithClient(client, {
          applicationId,
          ...record
        });
        results.push(result);
      }
    }
    return results;
  }
};

module.exports = EmploymentHistoryModel;
