const { query } = require('../config/database');

/**
 * PersonalInfo Model - Handles all database operations for personal information
 */
const PersonalInfoModel = {
  /**
   * Find personal info by ID
   * @param {string} id - PersonalInfo UUID
   * @returns {Promise<Object|null>} PersonalInfo record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM personal_info WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find personal info by application ID
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} PersonalInfo record or null
   */
  async findByApplicationId(applicationId) {
    const result = await query(
      'SELECT * FROM personal_info WHERE "applicationId" = $1',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Create personal info record
   * @param {Object} data - Personal info data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const {
      applicationId,
      firstName,
      lastName,
      middleName = null,
      dateOfBirth,
      gender,
      maritalStatus = null,
      nationality = 'GHANAIAN',
      hometown = null,
      district = null,
      region = null,
      ghanaCardNumber = null,
      heightCm = null,
      weightKg = null
    } = data;

    const result = await query(
      `INSERT INTO personal_info 
       ("applicationId", "firstName", "lastName", "middleName", "dateOfBirth", gender, 
        "maritalStatus", nationality, hometown, district, region, "ghanaCardNumber", "heightCm", "weightKg")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        applicationId, firstName, lastName, middleName, dateOfBirth, gender,
        maritalStatus, nationality, hometown, district, region, ghanaCardNumber, 
        (heightCm === '' ? null : heightCm), 
        (weightKg === '' ? null : weightKg)
      ]
    );
    return result.rows[0];
  },

  /**
   * Create personal info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} data - Personal info data
   * @returns {Promise<Object>} Created record
   */
  async createWithClient(client, data) {
    const {
      applicationId,
      firstName,
      lastName,
      middleName = null,
      dateOfBirth,
      gender,
      maritalStatus = null,
      nationality = 'GHANAIAN',
      hometown = null,
      district = null,
      region = null,
      ghanaCardNumber = null,
      heightCm = null,
      weightKg = null
    } = data;

    const result = await client.query(
      `INSERT INTO personal_info 
       ("applicationId", "firstName", "lastName", "middleName", "dateOfBirth", gender, 
        "maritalStatus", nationality, hometown, district, region, "ghanaCardNumber", "heightCm", "weightKg")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        applicationId, firstName, lastName, middleName, dateOfBirth, gender,
        maritalStatus, nationality, hometown, district, region, ghanaCardNumber, 
        (heightCm === '' ? null : heightCm), 
        (weightKg === '' ? null : weightKg)
      ]
    );
    return result.rows[0];
  },

  /**
   * Update personal info
   * @param {string} applicationId - Application UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated record or null
   */
  async update(applicationId, updates) {
    const fieldMapping = {
      firstName: '"firstName"',
      lastName: '"lastName"',
      middleName: '"middleName"',
      dateOfBirth: '"dateOfBirth"',
      gender: 'gender',
      maritalStatus: '"maritalStatus"',
      nationality: 'nationality',
      hometown: 'hometown',
      district: 'district',
      region: 'region',
      ghanaCardNumber: '"ghanaCardNumber"',
      heightCm: '"heightCm"',
      weightKg: '"weightKg"'
    };

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        // Normalize empty strings to null for decimal columns
        if ((key === 'heightCm' || key === 'weightKg') && value === '') {
          values.push(null);
        } else {
          values.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(applicationId);

    const result = await query(
      `UPDATE personal_info SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE "applicationId" = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  /**
   * Update personal info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated record or null
   */
  async updateWithClient(client, applicationId, updates) {
    const fieldMapping = {
      firstName: '"firstName"',
      lastName: '"lastName"',
      middleName: '"middleName"',
      dateOfBirth: '"dateOfBirth"',
      gender: 'gender',
      maritalStatus: '"maritalStatus"',
      nationality: 'nationality',
      hometown: 'hometown',
      district: 'district',
      region: 'region',
      ghanaCardNumber: '"ghanaCardNumber"',
      heightCm: '"heightCm"',
      weightKg: '"weightKg"'
    };

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        // Normalize empty strings to null for decimal columns
        if ((key === 'heightCm' || key === 'weightKg') && value === '') {
          values.push(null);
        } else {
          values.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(applicationId);

    const result = await client.query(
      `UPDATE personal_info SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE "applicationId" = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  /**
   * Upsert personal info (create or update)
   * @param {Object} data - Personal info data
   * @returns {Promise<Object>} Created or updated record
   */
  async upsert(data) {
    const existing = await this.findByApplicationId(data.applicationId);

    if (existing) {
      return await this.update(data.applicationId, data);
    } else {
      return await this.create(data);
    }
  },

  /**
   * Delete personal info
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} Deleted record or null
   */
  async delete(applicationId) {
    const result = await query(
      'DELETE FROM personal_info WHERE "applicationId" = $1 RETURNING id, "applicationId"',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete personal info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} Deleted record or null
   */
  async deleteWithClient(client, applicationId) {
    const result = await client.query(
      'DELETE FROM personal_info WHERE "applicationId" = $1 RETURNING id, "applicationId"',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all personal info records with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const { limit = 50, offset = 0, region = null, gender = null } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (region) {
      conditions.push(`region = $${paramCount++}`);
      values.push(region);
    }

    if (gender) {
      conditions.push(`gender = $${paramCount++}`);
      values.push(gender);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM personal_info ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT * FROM personal_info ${whereClause}
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
   * Count by gender
   * @returns {Promise<Array>} Array of { gender, count }
   */
  async countByGender() {
    const result = await query(
      `SELECT gender, COUNT(*) as count
       FROM personal_info
       GROUP BY gender
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Count by region
   * @returns {Promise<Array>} Array of { region, count }
   */
  async countByRegion() {
    const result = await query(
      `SELECT region, COUNT(*) as count
       FROM personal_info
       WHERE region IS NOT NULL
       GROUP BY region
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Count by marital status
   * @returns {Promise<Array>} Array of { maritalStatus, count }
   */
  async countByMaritalStatus() {
    const result = await query(
      `SELECT "maritalStatus", COUNT(*) as count
       FROM personal_info
       WHERE "maritalStatus" IS NOT NULL
       GROUP BY "maritalStatus"
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Get age distribution
   * @returns {Promise<Array>} Array of age ranges with counts
   */
  async getAgeDistribution() {
    const result = await query(`
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) < 20 THEN 'Under 20'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 20 AND 24 THEN '20-24'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 25 AND 29 THEN '25-29'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 30 AND 34 THEN '30-34'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 35 AND 39 THEN '35-39'
          ELSE '40+'
        END as "ageRange",
        COUNT(*) as count
      FROM personal_info
      GROUP BY "ageRange"
      ORDER BY "ageRange"
    `);
    return result.rows;
  },

  /**
   * Search by name
   * @param {string} searchTerm - Search term
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of matching records
   */
  async searchByName(searchTerm, limit = 20) {
    const result = await query(
      `SELECT pi.*, app."applicationId" as "appNumber"
       FROM personal_info pi
       LEFT JOIN applications app ON pi."applicationId" = app.id
       WHERE "firstName" ILIKE $1 OR "lastName" ILIKE $1 OR "middleName" ILIKE $1
       ORDER BY "lastName", "firstName"
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  },

  /**
   * Count total records
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM personal_info');
    return parseInt(result.rows[0].count);
  }
};

module.exports = PersonalInfoModel;
