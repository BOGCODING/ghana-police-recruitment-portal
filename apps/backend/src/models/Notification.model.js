const { query, transaction } = require('../config/database');

/**
 * Notification Model - Handles all database operations for notifications
 */
const NotificationModel = {
  /**
   * Find a notification by ID
   * @param {string} id - Notification UUID
   * @returns {Promise<Object|null>} Notification record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM notifications WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification record
   */
  async create(data) {
    const {
      userId,
      userType,
      title,
      message,
      type = null,
      data: metadata = null
    } = data;

    const result = await query(
      `INSERT INTO notifications ("userId", "userType", title, message, type, data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, userType, title, message, type, metadata ? JSON.stringify(metadata) : null]
    );
    return result.rows[0];
  },

  /**
   * Create notification with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification record
   */
  async createWithClient(client, data) {
    const {
      userId,
      userType,
      title,
      message,
      type = null,
      data: metadata = null
    } = data;

    const result = await client.query(
      `INSERT INTO notifications ("userId", "userType", title, message, type, data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, userType, title, message, type, metadata ? JSON.stringify(metadata) : null]
    );
    return result.rows[0];
  },

  /**
   * Create multiple notifications
   * @param {Array} notifications - Array of notification data
   * @returns {Promise<Array>} Array of created notifications
   */
  async createBatch(notifications) {
    return await transaction(async (client) => {
      const results = [];
      for (const notif of notifications) {
        const result = await client.query(
          `INSERT INTO notifications ("userId", "userType", title, message, type, data)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [notif.userId, notif.userType, notif.title, notif.message,
            notif.type || null, notif.data ? JSON.stringify(notif.data) : null]
        );
        results.push(result.rows[0]);
      }
      return results;
    });
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification UUID
   * @returns {Promise<Object|null>} Updated notification or null
   */
  async markAsRead(id) {
    const result = await query(
      `UPDATE notifications SET "isRead" = TRUE, "readAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User UUID
   * @param {string} userType - User type (admin, applicant)
   * @returns {Promise<number>} Number of updated records
   */
  async markAllAsRead(userId, userType) {
    const result = await query(
      `UPDATE notifications SET "isRead" = TRUE, "readAt" = NOW()
       WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = FALSE
       RETURNING id`,
      [userId, userType]
    );
    return result.rows.length;
  },

  /**
   * Delete a notification
   * @param {string} id - Notification UUID
   * @returns {Promise<Object|null>} Deleted notification or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id, title',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete all notifications for a user
   * @param {string} userId - User UUID
   * @param {string} userType - User type
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteAllForUser(userId, userType) {
    const result = await query(
      'DELETE FROM notifications WHERE "userId" = $1 AND "userType" = $2 RETURNING id',
      [userId, userType]
    );
    return result.rows.length;
  },

  /**
   * Find notifications by user
   * @param {string} userId - User UUID
   * @param {string} userType - User type
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total, unreadCount }
   */
  async findByUser(userId, userType, options = {}) {
    const { limit = 50, offset = 0, isRead = null } = options;

    let whereClause = 'WHERE "userId" = $1 AND "userType" = $2';
    const values = [userId, userType];
    let paramCount = 3;

    if (isRead !== null) {
      whereClause += ` AND "isRead" = $${paramCount++}`;
      values.push(isRead);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = FALSE',
      [userId, userType]
    );
    const unreadCount = parseInt(unreadResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT * FROM notifications ${whereClause}
       ORDER BY "createdAt" DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      paginationValues
    );

    return {
      rows: result.rows,
      total,
      unreadCount
    };
  },

  /**
   * Find unread notifications for a user
   * @param {string} userId - User UUID
   * @param {string} userType - User type
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of notifications
   */
  async findUnread(userId, userType, limit = 20) {
    const result = await query(
      `SELECT * FROM notifications
       WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = FALSE
       ORDER BY "createdAt" DESC LIMIT $3`,
      [userId, userType, limit]
    );
    return result.rows;
  },

  /**
   * Find notifications by type
   * @param {string} type - Notification type
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of notifications
   */
  async findByType(type, limit = 50) {
    const result = await query(
      `SELECT * FROM notifications WHERE type = $1
       ORDER BY "createdAt" DESC LIMIT $2`,
      [type, limit]
    );
    return result.rows;
  },

  /**
   * Count unread notifications for a user
   * @param {string} userId - User UUID
   * @param {string} userType - User type
   * @returns {Promise<number>} Unread count
   */
  async countUnread(userId, userType) {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = FALSE',
      [userId, userType]
    );
    return parseInt(result.rows[0].count);
  },

  /**
   * Get all notifications with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      type = null,
      userType = null,
      isRead = null
    } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (type) {
      conditions.push(`type = $${paramCount++}`);
      values.push(type);
    }

    if (userType) {
      conditions.push(`"userType" = $${paramCount++}`);
      values.push(userType);
    }

    if (isRead !== null) {
      conditions.push(`"isRead" = $${paramCount++}`);
      values.push(isRead);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT * FROM notifications ${whereClause}
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
   * Count total notifications
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM notifications');
    return parseInt(result.rows[0].count);
  },

  /**
   * Delete old read notifications
   * @param {number} days - Delete notifications older than this many days
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteOldRead(days = 30) {
    const result = await query(
      `DELETE FROM notifications
       WHERE "isRead" = TRUE AND "createdAt" < NOW() - INTERVAL '${days} days'
       RETURNING id`
    );
    return result.rows.length;
  },

  /**
   * Find recent notifications
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of notifications
   */
  async findRecent(limit = 20) {
    const result = await query(
      'SELECT * FROM notifications ORDER BY "createdAt" DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }
};

module.exports = NotificationModel;
