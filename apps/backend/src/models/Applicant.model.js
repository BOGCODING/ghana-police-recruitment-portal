const { query, transaction } = require('../config/database');

/**
 * Applicant Model - Handles all database operations for applicant users
 */
const ApplicantModel = {
  /**
   * Find an applicant by serial number
   * @param {string} serialNumber - Applicant serial number
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findBySerialNumber(serialNumber) {
    const result = await query(
      'SELECT * FROM applicants WHERE "serialNumber" = $1',
      [serialNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an applicant by ID
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM applicants WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an applicant by ID (excluding sensitive fields)
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object|null>} Applicant record without sensitive data or null
   */
  async findByIdSafe(id) {
    const result = await query(
      `SELECT id, "serialNumber", email, "phoneNumber", status, "emailVerified", 
              "lastLogin", "createdAt", "updatedAt" 
       FROM applicants WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an applicant by email
   * @param {string} email - Applicant email
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM applicants WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find applicant by email with application info
   * @param {string} email - Applicant email
   * @returns {Promise<Object|null>} Applicant with application data or null
   */
  async findByEmailWithApplication(email) {
    const result = await query(
      `SELECT a.*, app.id as "applicationId", app.status as "applicationStatus"
       FROM applicants a
       LEFT JOIN applications app ON a.id = app."applicantId"
       WHERE a.email = $1`,
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an applicant by phone number
   * @param {string} phoneNumber - Applicant phone number
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findByPhoneNumber(phoneNumber) {
    const result = await query(
      'SELECT * FROM applicants WHERE "phoneNumber" = $1',
      [phoneNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new applicant
   * @param {Object} applicantData - Applicant data
   * @returns {Promise<Object>} Created applicant record
   */
  async create(applicantData) {
    const {
      serialNumber,
      email,
      phoneNumber,
      passwordHash,
      status = 'REGISTERED',
      emailVerified = false,
      emailVerificationToken = null
    } = applicantData;

    const result = await query(
      `INSERT INTO applicants ("serialNumber", email, "phoneNumber", "passwordHash", status, "emailVerified", "emailVerificationToken")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, "serialNumber", email, "phoneNumber", status, "emailVerified", "createdAt"`,
      [serialNumber, email.toLowerCase(), phoneNumber, passwordHash, status, emailVerified, emailVerificationToken]
    );
    return result.rows[0];
  },

  /**
   * Create applicant with transaction (for atomic operations)
   * @param {Object} applicantData - Applicant data
   * @param {Function} additionalOperations - Callback for additional operations
   * @returns {Promise<Object>} Created applicant record
   */
  async createWithTransaction(applicantData, additionalOperations = null) {
    const {
      serialNumber,
      email,
      phoneNumber,
      passwordHash,
      status = 'REGISTERED',
      emailVerified = false,
      emailVerificationToken = null
    } = applicantData;

    return await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO applicants ("serialNumber", email, "phoneNumber", "passwordHash", status, "emailVerified", "emailVerificationToken")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, "serialNumber", email, "phoneNumber", status, "emailVerified", "createdAt"`,
        [serialNumber, email.toLowerCase(), phoneNumber, passwordHash, status, emailVerified, emailVerificationToken]
      );
      
      const applicant = result.rows[0];
      
      if (additionalOperations) {
        await additionalOperations(client, applicant);
      }
      
      return applicant;
    });
  },

  /**
   * Update applicant's last login timestamp
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object>} Updated applicant record
   */
  async updateLastLogin(id) {
    const result = await query(
      'UPDATE applicants SET "lastLogin" = NOW() WHERE id = $1 RETURNING id, "lastLogin"',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Update applicant details
   * @param {string} id - Applicant UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated applicant record or null
   */
  async update(id, updates) {
    const fieldMapping = {
      email: 'email',
      phoneNumber: '"phoneNumber"',
      status: 'status',
      emailVerified: '"emailVerified"'
    };
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        values.push(key === 'email' ? value.toLowerCase() : value);
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(id);
    
    const result = await query(
      `UPDATE applicants SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount}
       RETURNING id, "serialNumber", email, "phoneNumber", status, "emailVerified", "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  },

  /**
   * Update applicant password
   * @param {string} id - Applicant UUID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updatePassword(id, passwordHash) {
    const result = await query(
      'UPDATE applicants SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return result.rows.length > 0;
  },

  /**
   * Update applicant status
   * @param {string} id - Applicant UUID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated applicant or null
   */
  async updateStatus(id, status) {
    const result = await query(
      'UPDATE applicants SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Set password reset token
   * @param {string} id - Applicant UUID
   * @param {string} resetToken - Reset token
   * @param {Date} expiresAt - Token expiration date
   * @returns {Promise<boolean>} True if updated
   */
  async setResetToken(id, resetToken, expiresAt) {
    const result = await query(
      `UPDATE applicants 
       SET "resetToken" = $1, "resetTokenExpires" = $2, "updatedAt" = NOW() 
       WHERE id = $3 RETURNING id`,
      [resetToken, expiresAt, id]
    );
    return result.rows.length > 0;
  },

  /**
   * Find applicant by reset token
   * @param {string} resetToken - Reset token
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findByResetToken(resetToken) {
    const result = await query(
      `SELECT id, email FROM applicants 
       WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()`,
      [resetToken]
    );
    return result.rows[0] || null;
  },

  /**
   * Clear reset token after password reset
   * @param {string} id - Applicant UUID
   * @returns {Promise<boolean>} True if cleared
   */
  async clearResetToken(id) {
    const result = await query(
      `UPDATE applicants 
       SET "resetToken" = NULL, "resetTokenExpires" = NULL, "updatedAt" = NOW() 
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  },

  /**
   * Set email verification token
   * @param {string} id - Applicant UUID
   * @param {string} verificationToken - Verification token
   * @returns {Promise<boolean>} True if updated
   */
  async setEmailVerificationToken(id, verificationToken) {
    const result = await query(
      `UPDATE applicants 
       SET "emailVerificationToken" = $1, "updatedAt" = NOW() 
       WHERE id = $2 RETURNING id`,
      [verificationToken, id]
    );
    return result.rows.length > 0;
  },

  /**
   * Find applicant by email verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findByVerificationToken(token) {
    const result = await query(
      'SELECT id FROM applicants WHERE "emailVerificationToken" = $1',
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Verify applicant email
   * @param {string} id - Applicant UUID
   * @returns {Promise<boolean>} True if verified
   */
  async verifyEmail(id) {
    const result = await query(
      `UPDATE applicants 
       SET "emailVerified" = true, "emailVerificationToken" = NULL, "updatedAt" = NOW() 
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  },

  /**
   * Delete an applicant by ID (soft delete)
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object|null>} Deleted applicant data or null
   */
  async softDelete(id) {
    const result = await query(
      `UPDATE applicants 
       SET status = 'DELETED', "updatedAt" = NOW() 
       WHERE id = $1 RETURNING id, email`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Permanently delete an applicant
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object|null>} Deleted applicant data or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM applicants WHERE id = $1 RETURNING id, email',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all applicants with pagination
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const { limit = 20, offset = 0, status = null, emailVerified = null } = options;
    
    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`status = $${paramCount++}`);
      values.push(status);
    }
    
    if (emailVerified !== null) {
      conditions.push(`"emailVerified" = $${paramCount++}`);
      values.push(emailVerified);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM applicants ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT id, "serialNumber", email, "phoneNumber", status, "emailVerified", 
              "lastLogin", "createdAt"
       FROM applicants ${whereClause}
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
   * Check if an email is already registered
   * @param {string} email - Email to check
   * @param {string} excludeId - Optional applicant ID to exclude
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, excludeId = null) {
    let queryText = 'SELECT id FROM applicants WHERE email = $1';
    const values = [email.toLowerCase()];
    
    if (excludeId) {
      queryText += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await query(queryText, values);
    return result.rows.length > 0;
  },

  /**
   * Check if a serial number is already registered
   * @param {string} serialNumber - Serial number to check
   * @returns {Promise<boolean>} True if serial number exists
   */
  async serialNumberExists(serialNumber) {
    const result = await query(
      'SELECT id FROM applicants WHERE "serialNumber" = $1',
      [serialNumber]
    );
    return result.rows.length > 0;
  },

  /**
   * Check if a phone number is already registered
   * @param {string} phoneNumber - Phone number to check
   * @param {string} excludeId - Optional applicant ID to exclude
   * @returns {Promise<boolean>} True if phone number exists
   */
  async phoneNumberExists(phoneNumber, excludeId = null) {
    let queryText = 'SELECT id FROM applicants WHERE "phoneNumber" = $1';
    const values = [phoneNumber];
    
    if (excludeId) {
      queryText += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await query(queryText, values);
    return result.rows.length > 0;
  },

  /**
   * Count applicants by status
   * @returns {Promise<Array>} Array of { status, count }
   */
  async countByStatus() {
    const result = await query(
      `SELECT status, COUNT(*) as count 
       FROM applicants 
       GROUP BY status 
       ORDER BY status`
    );
    return result.rows;
  },

  /**
   * Get total applicants count
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM applicants');
    return parseInt(result.rows[0].count);
  },

  /**
   * Get applicants registered within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of applicant records
   */
  async findByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT id, "serialNumber", email, "phoneNumber", status, "createdAt"
       FROM applicants 
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
       ORDER BY "createdAt" DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Get applicant with full profile data (joined with personal_info)
   * @param {string} id - Applicant UUID
   * @returns {Promise<Object|null>} Full profile or null
   */
  async findWithProfile(id) {
    const result = await query(
      `SELECT a.*, 
              pi."firstName", pi."lastName", pi."dateOfBirth", pi.gender,
              pi."maritalStatus", pi.nationality, pi.hometown, pi.region
       FROM applicants a
       LEFT JOIN applications app ON a.id = app."applicantId"
       LEFT JOIN personal_info pi ON app.id = pi."applicationId"
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
};

module.exports = ApplicantModel;
