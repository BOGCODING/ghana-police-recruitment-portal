const { query } = require('../config/database');

/**
 * Regional Model - Handles all database operations for regional centers
 */
const RegionalModel = {
  /**
   * Find a regional center by ID
   * @param {string} id - Regional center UUID
   * @returns {Promise<Object|null>} Regional center record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM regional_centers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a regional center by region code
   * @param {string} code - Region code
   * @returns {Promise<Object|null>} Regional center record or null
   */
  async findByCode(code) {
    const result = await query(
      'SELECT * FROM regional_centers WHERE "regionCode" = $1',
      [code]
    );
    return result.rows[0] || null;
  },

  /**
   * Find regional center by name
   * @param {string} name - Center name
   * @returns {Promise<Object|null>} Regional center record or null
   */
  async findByName(name) {
    const result = await query(
      'SELECT * FROM regional_centers WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all active regional centers
   * @returns {Promise<Array>} Array of regional centers
   */
  async getAllCenters() {
    const result = await query(
      'SELECT * FROM regional_centers WHERE "isActive" = TRUE ORDER BY name'
    );
    return result.rows;
  },

  /**
   * Get all regional centers including inactive
   * @returns {Promise<Array>} Array of regional centers
   */
  async getAll() {
    const result = await query(
      'SELECT * FROM regional_centers ORDER BY name'
    );
    return result.rows;
  },

  /**
   * Create a new regional center
   * @param {Object} data - Regional center data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const {
      name,
      regionCode,
      location = null,
      contactInfo = null,
      capacity = null,
      isActive = true
    } = data;

    const result = await query(
      `INSERT INTO regional_centers (name, "regionCode", location, "contactInfo", capacity, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, regionCode, location,
        contactInfo ? JSON.stringify(contactInfo) : null,
        capacity, isActive]
    );
    return result.rows[0];
  },

  /**
   * Create regional center with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} data - Regional center data
   * @returns {Promise<Object>} Created record
   */
  async createWithClient(client, data) {
    const {
      name,
      regionCode,
      location = null,
      contactInfo = null,
      capacity = null,
      isActive = true
    } = data;

    const result = await client.query(
      `INSERT INTO regional_centers (name, "regionCode", location, "contactInfo", capacity, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, regionCode, location,
        contactInfo ? JSON.stringify(contactInfo) : null,
        capacity, isActive]
    );
    return result.rows[0];
  },

  /**
   * Update a regional center
   * @param {string} id - Regional center UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated record or null
   */
  async update(id, updates) {
    const fieldMapping = {
      name: 'name',
      regionCode: '"regionCode"',
      location: 'location',
      contactInfo: '"contactInfo"',
      capacity: 'capacity',
      isActive: '"isActive"'
    };

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        if (key === 'contactInfo') {
          values.push(value ? JSON.stringify(value) : null);
        } else {
          values.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(id);

    const result = await query(
      `UPDATE regional_centers SET ${setClauses.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  /**
   * Activate a regional center
   * @param {string} id - Regional center UUID
   * @returns {Promise<Object|null>} Updated record or null
   */
  async activate(id) {
    const result = await query(
      'UPDATE regional_centers SET "isActive" = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Deactivate a regional center
   * @param {string} id - Regional center UUID
   * @returns {Promise<Object|null>} Updated record or null
   */
  async deactivate(id) {
    const result = await query(
      'UPDATE regional_centers SET "isActive" = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a regional center
   * @param {string} id - Regional center UUID
   * @returns {Promise<Object|null>} Deleted record or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM regional_centers WHERE id = $1 RETURNING id, name, "regionCode"',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all regional centers with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      isActive = null,
      search = null
    } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (isActive !== null) {
      conditions.push(`"isActive" = $${paramCount++}`);
      values.push(isActive);
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramCount} OR "regionCode" ILIKE $${paramCount} OR location ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM regional_centers ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT * FROM regional_centers ${whereClause}
       ORDER BY name
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      paginationValues
    );

    return {
      rows: result.rows,
      total
    };
  },

  /**
   * Get centers with capacity info
   * @returns {Promise<Array>} Array of centers with capacity
   */
  async getCentersWithCapacity() {
    const result = await query(
      `SELECT * FROM regional_centers
       WHERE "isActive" = TRUE AND capacity IS NOT NULL
       ORDER BY capacity DESC`
    );
    return result.rows;
  },

  /**
   * Count applications by region
   * @returns {Promise<Array>} Array of { regionCode, name, applicationCount }
   */
  async countApplicationsByRegion() {
    const result = await query(`
      SELECT rc."regionCode", rc.name,
             COUNT(app.id) as "applicationCount"
      FROM regional_centers rc
      LEFT JOIN applications app ON app."preferredRegion" = rc."regionCode"
      GROUP BY rc."regionCode", rc.name
      ORDER BY "applicationCount" DESC
    `);
    return result.rows;
  },

  /**
   * Get region codes list
   * @returns {Promise<Array>} Array of region codes
   */
  async getRegionCodes() {
    const result = await query(
      'SELECT DISTINCT "regionCode" FROM regional_centers WHERE "isActive" = TRUE ORDER BY "regionCode"'
    );
    return result.rows.map(row => row.regionCode);
  },

  /**
   * Check if region code exists
   * @param {string} code - Region code
   * @returns {Promise<boolean>} True if exists
   */
  async regionCodeExists(code) {
    const result = await query(
      'SELECT 1 FROM regional_centers WHERE "regionCode" = $1 LIMIT 1',
      [code]
    );
    return result.rows.length > 0;
  },

  /**
   * Count total regional centers
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM regional_centers');
    return parseInt(result.rows[0].count);
  },

  /**
   * Count active regional centers
   * @returns {Promise<number>} Active count
   */
  async countActive() {
    const result = await query(
      'SELECT COUNT(*) FROM regional_centers WHERE "isActive" = TRUE'
    );
    return parseInt(result.rows[0].count);
  },

  /**
   * Get total capacity of all active centers
   * @returns {Promise<number>} Total capacity
   */
  async getTotalCapacity() {
    const result = await query(
      'SELECT COALESCE(SUM(capacity), 0) as "totalCapacity" FROM regional_centers WHERE "isActive" = TRUE'
    );
    return parseInt(result.rows[0].totalCapacity);
  }
};

module.exports = RegionalModel;
