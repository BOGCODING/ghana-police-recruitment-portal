const { query } = require('../config/database');

/**
 * AuditLog Model - Handles all database operations for audit logging
 */
const AuditLogModel = {
  /**
   * Log an action
   * @param {Object} data - Audit log data
   * @returns {Promise<Object>} Created audit log record
   */
  async logAction(data) {
    const { 
      action, 
      entityType, 
      entityId = null, 
      userId = null, 
      userType = null, 
      details = null, 
      ipAddress = null, 
      userAgent = null 
    } = data;
    
    const result = await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details, "ipAddress", "userAgent") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [action, entityType, entityId, userId, userType, 
        details ? JSON.stringify(details) : null, ipAddress, userAgent] 
    );
    return result.rows[0];
  },

  /**
   * Log action with transaction client (for atomic operations)
   * @param {Object} client - Database client from transaction
   * @param {Object} data - Audit log data
   * @returns {Promise<Object>} Created audit log record
   */
  async logActionWithClient(client, data) {
    const { 
      action, 
      entityType, 
      entityId = null, 
      userId = null, 
      userType = null, 
      details = null, 
      ipAddress = null, 
      userAgent = null 
    } = data;
    
    const result = await client.query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details, "ipAddress", "userAgent")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [action, entityType, entityId, userId, userType, 
        details ? JSON.stringify(details) : null, ipAddress, userAgent]
    );
    return result.rows[0];
  },

  /**
   * Find audit log by ID
   * @param {string} id - Audit log UUID
   * @returns {Promise<Object|null>} Audit log record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all audit logs with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      action = null, 
      entityType = null,
      userId = null,
      userType = null,
      startDate = null,
      endDate = null
    } = options;
    
    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (action) {
      conditions.push(`action = $${paramCount++}`);
      values.push(action);
    }
    
    if (entityType) {
      conditions.push(`"entityType" = $${paramCount++}`);
      values.push(entityType);
    }

    if (userId) {
      conditions.push(`"userId" = $${paramCount++}`);
      values.push(userId);
    }

    if (userType) {
      conditions.push(`"userType" = $${paramCount++}`);
      values.push(userType);
    }

    if (startDate) {
      conditions.push(`"createdAt" >= $${paramCount++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`"createdAt" <= $${paramCount++}`);
      values.push(endDate);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT * FROM audit_logs ${whereClause}
       ORDER BY "createdAt" DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      paginationValues
    );

    return {
      rows: result.rows,
      total
    };
  },

  /**
   * Find logs by entity
   * @param {string} entityType - Entity type (admin, application, etc.)
   * @param {string} entityId - Entity UUID
   * @returns {Promise<Array>} Array of audit logs
   */
  async findByEntity(entityType, entityId) {
    const result = await query(
      `SELECT * FROM audit_logs 
       WHERE "entityType" = $1 AND "entityId" = $2 
       ORDER BY "createdAt" DESC`,
      [entityType, entityId]
    );
    return result.rows;
  },

  /**
   * Find logs by user
   * @param {string} userId - User UUID
   * @param {string} userType - User type (admin, applicant)
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of audit logs
   */
  async findByUser(userId, userType = null, limit = 50) {
    let queryText = 'SELECT * FROM audit_logs WHERE "userId" = $1';
    const values = [userId];
    let paramCount = 2;

    if (userType) {
      queryText += ` AND "userType" = $${paramCount++}`;
      values.push(userType);
    }

    queryText += ` ORDER BY "createdAt" DESC LIMIT $${paramCount}`;
    values.push(limit);

    const result = await query(queryText, values);
    return result.rows;
  },

  /**
   * Find logs by action
   * @param {string} action - Action type
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of audit logs
   */
  async findByAction(action, limit = 50) {
    const result = await query(
      `SELECT * FROM audit_logs 
       WHERE action = $1 
       ORDER BY "createdAt" DESC LIMIT $2`,
      [action, limit]
    );
    return result.rows;
  },

  /**
   * Get recent logs
   * @param {number} limit - Number of logs to return
   * @returns {Promise<Array>} Array of audit logs
   */
  async findRecent(limit = 20) {
    const result = await query(
      `SELECT * FROM audit_logs 
       ORDER BY "createdAt" DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Get logs within date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of audit logs
   */
  async findByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT * FROM audit_logs 
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
       ORDER BY "createdAt" DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Count logs by action type
   * @returns {Promise<Array>} Array of { action, count }
   */
  async countByAction() {
    const result = await query(
      `SELECT action, COUNT(*) as count 
       FROM audit_logs 
       GROUP BY action 
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Count logs by entity type
   * @returns {Promise<Array>} Array of { entityType, count }
   */
  async countByEntityType() {
    const result = await query(
      `SELECT "entityType", COUNT(*) as count 
       FROM audit_logs 
       GROUP BY "entityType" 
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Delete old logs (for cleanup)
   * @param {Date} olderThan - Delete logs older than this date
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteOlderThan(olderThan) {
    const result = await query(
      'DELETE FROM audit_logs WHERE "createdAt" < $1 RETURNING id',
      [olderThan]
    );
    return result.rows.length;
  },

  /**
   * Get activity summary for a user
   * @param {string} userId - User UUID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Activity summary
   */
  async getUserActivitySummary(userId, days = 30) {
    const result = await query(
      `SELECT action, COUNT(*) as count, MAX("createdAt") as "lastPerformed"
       FROM audit_logs 
       WHERE "userId" = $1 AND "createdAt" >= NOW() - INTERVAL '${days} days'
       GROUP BY action 
       ORDER BY count DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Search audit logs by IP address
   * @param {string} ipAddress - IP address to search
   * @returns {Promise<Array>} Array of audit logs
   */
  async findByIpAddress(ipAddress) {
    const result = await query(
      `SELECT * FROM audit_logs 
       WHERE "ipAddress" = $1 
       ORDER BY "createdAt" DESC`,
      [ipAddress]
    );
    return result.rows;
  }
};

module.exports = AuditLogModel;
