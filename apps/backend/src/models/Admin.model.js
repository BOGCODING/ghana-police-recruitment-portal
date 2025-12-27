const { query, transaction } = require('../config/database');

/**
 * Admin Model - Handles all database operations for admin users
 */
const AdminModel = {
  /**
   * Find an admin by email
   * @param {string} email - Admin email
   * @returns {Promise<Object|null>} Admin record or null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an admin by ID
   * @param {string} id - Admin UUID
   * @returns {Promise<Object|null>} Admin record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM admins WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an admin by ID (excluding password hash for safe responses)
   * @param {string} id - Admin UUID
   * @returns {Promise<Object|null>} Admin record without password or null
   */
  async findByIdSafe(id) {
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", 
              "isActive", "lastLogin", "createdAt", "updatedAt" 
       FROM admins WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an admin by role
   * @param {string} role - Admin role (SUPER_ADMIN, REGIONAL_ADMIN, etc.)
   * @returns {Promise<Object|null>} Admin record or null
   */
  async findByRole(role) {
    const result = await query(
      'SELECT * FROM admins WHERE role = $1',
      [role]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all admins with a specific role
   * @param {string} role - Admin role
   * @returns {Promise<Array>} Array of admin records
   */
  async findAllByRole(role) {
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", 
              "isActive", "lastLogin", "createdAt" 
       FROM admins WHERE role = $1 ORDER BY "createdAt" DESC`,
      [role]
    );
    return result.rows;
  },

  /**
   * Create a new admin
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>} Created admin record
   */
  async create(adminData) {
    const {
      email,
      passwordHash,
      firstName,
      lastName,
      role = 'VIEWER',
      assignedRegions = [],
      isActive = true
    } = adminData;

    const result = await query(
      `INSERT INTO admins (email, "passwordHash", "firstName", "lastName", role, "assignedRegions", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "createdAt"`,
      [email.toLowerCase(), passwordHash, firstName, lastName, role, assignedRegions, isActive]
    );
    return result.rows[0];
  },

  /**
   * Create admin with transaction (for atomic operations with related data)
   * @param {Object} adminData - Admin data
   * @param {Function} additionalOperations - Callback for additional operations within transaction
   * @returns {Promise<Object>} Created admin record
   */
  async createWithTransaction(adminData, additionalOperations = null) {
    const {
      email,
      passwordHash,
      firstName,
      lastName,
      role = 'VIEWER',
      assignedRegions = [],
      isActive = true
    } = adminData;

    return await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO admins (email, "passwordHash", "firstName", "lastName", role, "assignedRegions", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "createdAt"`,
        [email.toLowerCase(), passwordHash, firstName, lastName, role, assignedRegions, isActive]
      );
      
      const admin = result.rows[0];
      
      if (additionalOperations) {
        await additionalOperations(client, admin);
      }
      
      return admin;
    });
  },

  /**
   * Update admin's last login timestamp
   * @param {string} id - Admin UUID
   * @returns {Promise<Object>} Updated admin record
   */
  async updateLastLogin(id) {
    const result = await query(
      'UPDATE admins SET "lastLogin" = NOW() WHERE id = $1 RETURNING id, "lastLogin"',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Update admin details
   * @param {string} id - Admin UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated admin record or null if not found
   */
  async update(id, updates) {
    const fieldMapping = {
      email: 'email',
      firstName: '"firstName"',
      lastName: '"lastName"',
      role: 'role',
      assignedRegions: '"assignedRegions"',
      isActive: '"isActive"'
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
      `UPDATE admins SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount}
       RETURNING id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  },

  /**
   * Update admin password
   * @param {string} id - Admin UUID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updatePassword(id, passwordHash) {
    const result = await query(
      'UPDATE admins SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return result.rows.length > 0;
  },

  /**
   * Delete an admin by ID
   * @param {string} id - Admin UUID
   * @returns {Promise<Object|null>} Deleted admin record or null if not found
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM admins WHERE id = $1 RETURNING id, email, role',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete admin with transaction (for atomic operations with related data)
   * @param {string} id - Admin UUID
   * @param {Function} preDeleteOperations - Callback for operations before deletion
   * @returns {Promise<Object|null>} Deleted admin record or null
   */
  async deleteWithTransaction(id, preDeleteOperations = null) {
    return await transaction(async (client) => {
      // Get admin info first
      const adminResult = await client.query(
        'SELECT id, email, role FROM admins WHERE id = $1',
        [id]
      );
      
      if (adminResult.rows.length === 0) {
        return null;
      }
      
      const admin = adminResult.rows[0];
      
      if (preDeleteOperations) {
        await preDeleteOperations(client, admin);
      }
      
      await client.query('DELETE FROM admins WHERE id = $1', [id]);
      
      return admin;
    });
  },

  /**
   * Get all admins with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const { limit = 20, offset = 0, isActive = null, role = null } = options;
    
    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (isActive !== null) {
      conditions.push(`"isActive" = $${paramCount++}`);
      values.push(isActive);
    }
    
    if (role) {
      conditions.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM admins ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", 
              "isActive", "lastLogin", "createdAt"
       FROM admins ${whereClause}
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
   * @param {string} excludeId - Optional admin ID to exclude from check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, excludeId = null) {
    let queryText = 'SELECT id FROM admins WHERE email = $1';
    const values = [email.toLowerCase()];
    
    if (excludeId) {
      queryText += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await query(queryText, values);
    return result.rows.length > 0;
  },

  /**
   * Get admins by assigned region
   * @param {string} region - Region name
   * @returns {Promise<Array>} Array of admin records
   */
  async findByRegion(region) {
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "lastLogin"
       FROM admins 
       WHERE $1 = ANY("assignedRegions") AND "isActive" = true
       ORDER BY role, "firstName"`,
      [region]
    );
    return result.rows;
  },

  /**
   * Count admins by role
   * @returns {Promise<Array>} Array of { role, count }
   */
  async countByRole() {
    const result = await query(
      `SELECT role, COUNT(*) as count 
       FROM admins 
       GROUP BY role 
       ORDER BY role`
    );
    return result.rows;
  },

  /**
   * Activate or deactivate an admin
   * @param {string} id - Admin UUID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object|null>} Updated admin or null
   */
  async setActiveStatus(id, isActive) {
    const result = await query(
      `UPDATE admins SET "isActive" = $1, "updatedAt" = NOW() 
       WHERE id = $2 
       RETURNING id, email, "isActive"`,
      [isActive, id]
    );
    return result.rows[0] || null;
  }
};

module.exports = AdminModel;
