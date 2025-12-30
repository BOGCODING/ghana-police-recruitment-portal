const { query, transaction } = require('../config/database');

/**
 * Voucher Model - Handles all database operations for vouchers
 */
const VoucherModel = {
  /**
   * Find a voucher by ID
   * @param {string} id - Voucher UUID
   * @returns {Promise<Object|null>} Voucher record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM vouchers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a voucher by code
   * @param {string} code - Voucher code
   * @returns {Promise<Object|null>} Voucher record or null
   */
  async findByCode(code) {
    const result = await query(
      'SELECT * FROM vouchers WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a voucher by serial number
   * @param {string} serialNumber - Serial number
   * @returns {Promise<Object|null>} Voucher record or null
   */
  async findBySerialNumber(serialNumber) {
    const result = await query(
      'SELECT * FROM vouchers WHERE "serialNumber" = $1',
      [serialNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a voucher by serial number and PIN code
   * @param {string} serialNumber - Serial number
   * @param {string} pinCode - PIN code
   * @returns {Promise<Object|null>} Voucher record or null
   */
  async findBySerialAndPin(serialNumber, pinCode) {
    const result = await query(
      'SELECT * FROM vouchers WHERE "serialNumber" = $1 AND "pinCode" = $2',
      [serialNumber, pinCode]
    );
    return result.rows[0] || null;
  },

  /**
   * Find voucher by serial and pin with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} serialNumber - Serial number
   * @param {string} pinCode - PIN code
   * @returns {Promise<Object|null>} Voucher record or null
   */
  async findBySerialAndPinWithClient(client, serialNumber, pinCode) {
    const result = await client.query(
      'SELECT * FROM vouchers WHERE "serialNumber" = $1 AND "pinCode" = $2',
      [serialNumber, pinCode]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new voucher
   * @param {Object} voucherData - Voucher data
   * @returns {Promise<Object>} Created voucher record
   */
  async create(voucherData) {
    const {
      code,
      email = null,
      phoneNumber = null,
      serialNumber,
      pinCode,
      expiresAt,
      generatedBy = null,
      notes = null
    } = voucherData;

    const result = await query(
      `INSERT INTO vouchers (code, email, "phoneNumber", "serialNumber", "pinCode", "expiresAt", "generatedBy", notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, email, phoneNumber, serialNumber, pinCode, expiresAt, generatedBy, notes]
    );
    return result.rows[0];
  },

  /**
   * Create voucher with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} voucherData - Voucher data
   * @returns {Promise<Object>} Created voucher record
   */
  async createWithClient(client, voucherData) {
    const {
      code,
      email = null,
      phoneNumber = null,
      serialNumber,
      pinCode,
      expiresAt,
      generatedBy = null,
      notes = null
    } = voucherData;

    const result = await client.query(
      `INSERT INTO vouchers (code, email, "phoneNumber", "serialNumber", "pinCode", "expiresAt", "generatedBy", notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, email, phoneNumber, serialNumber, pinCode, expiresAt, generatedBy, notes]
    );
    return result.rows[0];
  },

  /**
   * Create multiple vouchers
   * @param {Array} vouchers - Array of voucher data
   * @param {string} generatedBy - Admin UUID who generated
   * @returns {Promise<Array>} Array of created vouchers
   */
  async createBatch(vouchers, generatedBy = null) {
    return await transaction(async (client) => {
      const results = [];
      for (const voucher of vouchers) {
        const result = await client.query(
          `INSERT INTO vouchers (code, email, "phoneNumber", "serialNumber", "pinCode", "expiresAt", "generatedBy", notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [voucher.code, voucher.email || null, voucher.phoneNumber || null,
            voucher.serialNumber, voucher.pinCode, voucher.expiresAt,
            generatedBy, voucher.notes || null]
        );
        results.push(result.rows[0]);
      }
      return results;
    });
  },

  /**
   * Mark voucher as used
   * @param {string} id - Voucher UUID
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Object|null>} Updated voucher or null
   */
  async markAsUsed(id, applicantId, email = null, phoneNumber = null) {
    const result = await query(
      `UPDATE vouchers
       SET "isUsed" = TRUE, "usedAt" = NOW(), "applicantId" = $2,
           email = COALESCE(email, $3),
           "phoneNumber" = COALESCE("phoneNumber", $4)
       WHERE id = $1 RETURNING *`,
      [id, applicantId, email, phoneNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark voucher as used with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} id - Voucher UUID
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Object|null>} Updated voucher or null
   */
  async markAsUsedWithClient(client, id, applicantId, email = null, phoneNumber = null) {
    const result = await client.query(
      `UPDATE vouchers
       SET "isUsed" = TRUE, "usedAt" = NOW(), "applicantId" = $2,
           email = COALESCE(email, $3),
           "phoneNumber" = COALESCE("phoneNumber", $4)
       WHERE id = $1 RETURNING *`,
      [id, applicantId, email, phoneNumber]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark voucher as validated
   * @param {string} id - Voucher UUID
   * @returns {Promise<Object|null>} Updated voucher or null
   */
  async markAsValidated(id) {
    const result = await query(
      `UPDATE vouchers SET "validatedAt" = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Deactivate a voucher
   * @param {string} id - Voucher UUID
   * @param {string} adminId - Admin UUID who deactivated
   * @returns {Promise<Object|null>} Updated voucher or null
   */
  async deactivate(id, adminId) {
    const result = await query(
      `UPDATE vouchers
       SET "deactivatedAt" = NOW(), "deactivatedBy" = $2
       WHERE id = $1 RETURNING *`,
      [id, adminId]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if voucher is valid (not used, not expired, not deactivated)
   * @param {string} id - Voucher UUID
   * @returns {Promise<boolean>} True if valid
   */
  async isValid(id) {
    const result = await query(
      `SELECT 1 FROM vouchers
       WHERE id = $1
       AND "isUsed" = FALSE
       AND "expiresAt" > NOW()
       AND "deactivatedAt" IS NULL
       LIMIT 1`,
      [id]
    );
    return result.rows.length > 0;
  },

  /**
   * Delete a voucher
   * @param {string} id - Voucher UUID
   * @returns {Promise<Object|null>} Deleted voucher or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM vouchers WHERE id = $1 RETURNING id, code, "serialNumber"',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all vouchers with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      isUsed = null,
      isExpired = null,
      isDeactivated = null,
      generatedBy = null,
      search = null,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (isUsed !== null) {
      conditions.push(`v."isUsed" = $${paramCount++}`);
      values.push(isUsed);
    }

    if (isExpired === true) {
      conditions.push('v."expiresAt" < NOW()');
    } else if (isExpired === false) {
      conditions.push('v."expiresAt" >= NOW()');
    }

    if (isDeactivated === true) {
      conditions.push('v."deactivatedAt" IS NOT NULL');
    } else if (isDeactivated === false) {
      conditions.push('v."deactivatedAt" IS NULL');
    }

    if (generatedBy) {
      conditions.push(`v."generatedBy" = $${paramCount++}`);
      values.push(generatedBy);
    }

    if (search) {
      conditions.push(`(v.code ILIKE $${paramCount} OR v."serialNumber" ILIKE $${paramCount} OR v.email ILIKE $${paramCount} OR a.email ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const validSortColumns = ['createdAt', 'expiresAt', 'usedAt', 'code'];
    const sortColumn = validSortColumns.includes(sortBy) ? `v."${sortBy}"` : 'v."createdAt"';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM vouchers v 
       LEFT JOIN applicants a ON v."applicantId" = a.id
       ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT v.*, a.email as "applicantEmail" 
       FROM vouchers v
       LEFT JOIN applicants a ON v."applicantId" = a.id
       ${whereClause}
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
   * Find unused vouchers
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of vouchers
   */
  async findUnused(limit = 50) {
    const result = await query(
      `SELECT * FROM vouchers
       WHERE "isUsed" = FALSE AND "expiresAt" > NOW() AND "deactivatedAt" IS NULL
       ORDER BY "createdAt" DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Find expired vouchers
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of vouchers
   */
  async findExpired(limit = 50) {
    const result = await query(
      `SELECT * FROM vouchers
       WHERE "expiresAt" < NOW() AND "isUsed" = FALSE
       ORDER BY "expiresAt" DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Find vouchers by applicant
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Array>} Array of vouchers
   */
  async findByApplicant(applicantId) {
    const result = await query(
      'SELECT * FROM vouchers WHERE "applicantId" = $1 ORDER BY "createdAt" DESC',
      [applicantId]
    );
    return result.rows;
  },

  /**
   * Find vouchers generated by admin
   * @param {string} adminId - Admin UUID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of vouchers
   */
  async findByAdmin(adminId, limit = 50) {
    const result = await query(
      `SELECT * FROM vouchers WHERE "generatedBy" = $1
       ORDER BY "createdAt" DESC LIMIT $2`,
      [adminId, limit]
    );
    return result.rows;
  },

  /**
   * Count vouchers by status
   * @returns {Promise<Object>} { total, used, unused, expired }
   */
  async countByStatus() {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN "isUsed" = TRUE THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN "isUsed" = FALSE AND "expiresAt" > NOW() AND "deactivatedAt" IS NULL THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN "expiresAt" < NOW() AND "isUsed" = FALSE THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN "deactivatedAt" IS NOT NULL THEN 1 ELSE 0 END) as deactivated
      FROM vouchers
    `);
    const row = result.rows[0];
    return {
      total: parseInt(row.total) || 0,
      used: parseInt(row.used) || 0,
      unused: parseInt(row.unused) || 0,
      expired: parseInt(row.expired) || 0,
      deactivated: parseInt(row.deactivated) || 0
    };
  },

  /**
   * Count total vouchers
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM vouchers');
    return parseInt(result.rows[0].count);
  },

  /**
   * Delete expired and unused vouchers
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteExpired() {
    const result = await query(
      `DELETE FROM vouchers
       WHERE "expiresAt" < NOW() AND "isUsed" = FALSE
       RETURNING id`
    );
    return result.rows.length;
  },

  /**
   * Check if serial number exists
   * @param {string} serialNumber - Serial number
   * @returns {Promise<boolean>} True if exists
   */
  async serialNumberExists(serialNumber) {
    const result = await query(
      'SELECT 1 FROM vouchers WHERE "serialNumber" = $1 LIMIT 1',
      [serialNumber]
    );
    return result.rows.length > 0;
  },

  /**
   * Check if code exists
   * @param {string} code - Voucher code
   * @returns {Promise<boolean>} True if exists
   */
  async codeExists(code) {
    const result = await query(
      'SELECT 1 FROM vouchers WHERE code = $1 LIMIT 1',
      [code]
    );
    return result.rows.length > 0;
  }
};

module.exports = VoucherModel;
