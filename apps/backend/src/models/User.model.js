const { query, transaction } = require('../config/database');

/**
 * User Model - Handles all database operations for users
 */
const UserModel = {
  /**
   * Find a user by ID
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User record or null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by email (case insensitive)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User record or null
   */
  async findByEmailCaseInsensitive(email) {
    const result = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user record
   */
  async create(userData) {
    const { email, passwordHash, userType = 'applicant' } = userData;
    const result = await query(
      `INSERT INTO users (email, "passwordHash", "userType")
       VALUES ($1, $2, $3) RETURNING *`,
      [email, passwordHash, userType]
    );
    return result.rows[0];
  },

  /**
   * Create user with transaction
   * @param {Object} client - Database client from transaction
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user record
   */
  async createWithClient(client, userData) {
    const { email, passwordHash, userType = 'applicant' } = userData;
    const result = await client.query(
      `INSERT INTO users (email, "passwordHash", "userType")
       VALUES ($1, $2, $3) RETURNING *`,
      [email, passwordHash, userType]
    );
    return result.rows[0];
  },

  /**
   * Update user password
   * @param {string} id - User UUID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updatePassword(id, passwordHash) {
    const result = await query(
      `UPDATE users SET "passwordHash" = $2, "updatedAt" = NOW()
       WHERE id = $1 RETURNING id, email, "userType", "updatedAt"`,
      [id, passwordHash]
    );
    return result.rows[0] || null;
  },

  /**
   * Update user email
   * @param {string} id - User UUID
   * @param {string} email - New email
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateEmail(id, email) {
    const result = await query(
      `UPDATE users SET email = $2, "updatedAt" = NOW()
       WHERE id = $1 RETURNING id, email, "userType", "updatedAt"`,
      [id, email]
    );
    return result.rows[0] || null;
  },

  /**
   * Update last login timestamp
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateLastLogin(id) {
    const result = await query(
      `UPDATE users SET "lastLogin" = NOW()
       WHERE id = $1 RETURNING id, "lastLogin"`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Activate a user
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async activate(id) {
    const result = await query(
      `UPDATE users SET "isActive" = TRUE, "updatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Deactivate a user
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async deactivate(id) {
    const result = await query(
      `UPDATE users SET "isActive" = FALSE, "updatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a user
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Deleted user or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, "userType"',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete user with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Deleted user or null
   */
  async deleteWithClient(client, id) {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, "userType"',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Update user password with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updatePasswordWithClient(client, id, passwordHash) {
    const result = await client.query(
      `UPDATE users SET "passwordHash" = $2, "updatedAt" = NOW()
       WHERE id = $1 RETURNING id, email, "userType", "updatedAt"`,
      [id, passwordHash]
    );
    return result.rows[0] || null;
  },

  /**
   * Update user email with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @param {string} email - New email
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateEmailWithClient(client, id, email) {
    const result = await client.query(
      `UPDATE users SET email = $2, "updatedAt" = NOW()
       WHERE id = $1 RETURNING id, email, "userType", "updatedAt"`,
      [id, email]
    );
    return result.rows[0] || null;
  },

  /**
   * Update last login with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateLastLoginWithClient(client, id) {
    const result = await client.query(
      `UPDATE users SET "lastLogin" = NOW()
       WHERE id = $1 RETURNING id, "lastLogin"`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Activate user with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async activateWithClient(client, id) {
    const result = await client.query(
      `UPDATE users SET "isActive" = TRUE, "updatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Deactivate user with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} Updated user or null
   */
  async deactivateWithClient(client, id) {
    const result = await client.query(
      `UPDATE users SET "isActive" = FALSE, "updatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create user with full transaction (handles BEGIN/COMMIT/ROLLBACK)
   * @param {Object} userData - User data
   * @param {Function} additionalOperations - Optional callback for related operations
   * @returns {Promise<Object>} Created user record
   */
  async createWithTransaction(userData, additionalOperations = null) {
    return await transaction(async (client) => {
      const { email, passwordHash, userType = 'applicant' } = userData;
      const result = await client.query(
        `INSERT INTO users (email, "passwordHash", "userType")
         VALUES ($1, $2, $3) RETURNING *`,
        [email, passwordHash, userType]
      );
      const user = result.rows[0];

      if (additionalOperations) {
        await additionalOperations(client, user);
      }

      return user;
    });
  },

  /**
   * Find user by ID with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User record or null
   */
  async findByIdWithClient(client, id) {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by email with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User record or null
   */
  async findByEmailWithClient(client, email) {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      userType = null,
      isActive = null,
      search = null,
      sortBy = '"createdAt"',
      sortOrder = 'DESC'
    } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (userType) {
      conditions.push(`"userType" = $${paramCount++}`);
      values.push(userType);
    }

    if (isActive !== null) {
      conditions.push(`"isActive" = $${paramCount++}`);
      values.push(isActive);
    }

    if (search) {
      conditions.push(`email ILIKE $${paramCount++}`);
      values.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const validSortColumns = ['"createdAt"', '"updatedAt"', 'email', '"lastLogin"'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : '"createdAt"';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT id, email, "userType", "isActive", "lastLogin", "createdAt", "updatedAt"
       FROM users ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      paginationValues
    );

    return {
      rows: result.rows,
      total
    };
  },

  /**
   * Count users by type
   * @returns {Promise<Array>} Array of { userType, count }
   */
  async countByType() {
    const result = await query(
      `SELECT "userType", COUNT(*) as count
       FROM users
       GROUP BY "userType"
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Count total users
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  },

  /**
   * Find active users
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of users
   */
  async findActive(limit = 50) {
    const result = await query(
      `SELECT id, email, "userType", "lastLogin", "createdAt"
       FROM users
       WHERE "isActive" = TRUE
       ORDER BY "lastLogin" DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async emailExists(email) {
    const result = await query(
      'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email]
    );
    return result.rows.length > 0;
  },

  /**
   * Find users who logged in recently
   * @param {number} days - Number of days to look back
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of users
   */
  async findRecentlyActive(days = 7, limit = 50) {
    const result = await query(
      `SELECT id, email, "userType", "lastLogin", "createdAt"
       FROM users
       WHERE "lastLogin" >= NOW() - INTERVAL '${days} days'
       ORDER BY "lastLogin" DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
};

module.exports = UserModel;
