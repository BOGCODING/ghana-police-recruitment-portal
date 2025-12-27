const { query, transaction } = require('../config/database');

/**
 * ContactInfo Model - Handles all database operations for applicant contact information
 */
const ContactInfoModel = {
  /**
   * Find contact info by application ID
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} Contact info record or null
   */
  async findByApplicationId(applicationId) {
    const result = await query(
      'SELECT * FROM contact_info WHERE "applicationId" = $1',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find contact info by ID
   * @param {string} id - Contact info UUID
   * @returns {Promise<Object|null>} Contact info record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM contact_info WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create contact info
   * @param {Object} contactData - Contact information data
   * @returns {Promise<Object>} Created contact info record
   */
  async create(contactData) {
    const {
      applicationId,
      email,
      phoneNumber,
      alternatePhone = null,
      residentialAddress = null,
      postalAddress = null,
      digitalAddress = null,
      emergencyContactName = null,
      emergencyContactPhone = null,
      emergencyContactRelation = null
    } = contactData;

    const result = await query(
      `INSERT INTO contact_info 
       ("applicationId", email, "phoneNumber", "alternatePhone", "residentialAddress", "postalAddress", 
        "digitalAddress", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [applicationId, email, phoneNumber, alternatePhone, residentialAddress, postalAddress,
        digitalAddress, emergencyContactName, emergencyContactPhone, emergencyContactRelation]
    );
    return result.rows[0];
  },

  /**
   * Create contact info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {Object} contactData - Contact information data
   * @returns {Promise<Object>} Created contact info record
   */
  async createWithClient(client, contactData) {
    const {
      applicationId,
      email,
      phoneNumber,
      alternatePhone = null,
      residentialAddress = null,
      postalAddress = null,
      digitalAddress = null,
      emergencyContactName = null,
      emergencyContactPhone = null,
      emergencyContactRelation = null
    } = contactData;

    const result = await client.query(
      `INSERT INTO contact_info 
       ("applicationId", email, "phoneNumber", "alternatePhone", "residentialAddress", "postalAddress", 
        "digitalAddress", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [applicationId, email, phoneNumber, alternatePhone, residentialAddress, postalAddress,
        digitalAddress, emergencyContactName, emergencyContactPhone, emergencyContactRelation]
    );
    return result.rows[0];
  },

  /**
   * Update contact info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated contact info or null
   */
  async updateWithClient(client, applicationId, updates) {
    const fieldMapping = {
      email: 'email',
      phoneNumber: '"phoneNumber"',
      alternatePhone: '"alternatePhone"',
      residentialAddress: '"residentialAddress"',
      postalAddress: '"postalAddress"',
      digitalAddress: '"digitalAddress"',
      emergencyContactName: '"emergencyContactName"',
      emergencyContactPhone: '"emergencyContactPhone"',
      emergencyContactRelation: '"emergencyContactRelation"'
    };

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(applicationId);

    const result = await client.query(
      `UPDATE contact_info SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE "applicationId" = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  /**
   * Upsert contact info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @param {Object} contactData - Contact information data
   * @returns {Promise<Object>} Contact info record
   */
  async upsertWithClient(client, applicationId, contactData) {
    const checkResult = await client.query(
      'SELECT id FROM contact_info WHERE "applicationId" = $1',
      [applicationId]
    );

    if (checkResult.rows.length > 0) {
      return await this.updateWithClient(client, applicationId, contactData);
    } else {
      return await this.createWithClient(client, { applicationId: applicationId, ...contactData });
    }
  },

  /**
   * Upsert contact info within a transaction
   * @param {string} applicationId - Application UUID
   * @param {Object} contactData - Contact information data
   * @returns {Promise<Object>} Contact info record
   */
  async upsertWithTransaction(applicationId, contactData) {
    return await transaction(async (client) => {
      return await this.upsertWithClient(client, applicationId, contactData);
    });
  },

  /**
   * Delete contact info with transaction client
   * @param {Object} client - Database client from transaction
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} Deleted record or null
   */
  async deleteWithClient(client, applicationId) {
    const result = await client.query(
      'DELETE FROM contact_info WHERE "applicationId" = $1 RETURNING id',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update contact info
   * @param {string} applicationId - Application UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated contact info or null
   */
  async update(applicationId, updates) {
    const fieldMapping = {
      email: 'email',
      phoneNumber: '"phoneNumber"',
      alternatePhone: '"alternatePhone"',
      residentialAddress: '"residentialAddress"',
      postalAddress: '"postalAddress"',
      digitalAddress: '"digitalAddress"',
      emergencyContactName: '"emergencyContactName"',
      emergencyContactPhone: '"emergencyContactPhone"',
      emergencyContactRelation: '"emergencyContactRelation"'
    };
    
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    values.push(applicationId);
    
    const result = await query(
      `UPDATE contact_info SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE "applicationId" = $${paramCount}
       RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  },

  /**
   * Upsert contact info (create or update)
   * @param {string} applicationId - Application UUID
   * @param {Object} contactData - Contact information data
   * @returns {Promise<Object>} Contact info record
   */
  async upsert(applicationId, contactData) {
    const existing = await this.findByApplicationId(applicationId);
    
    if (existing) {
      return await this.update(applicationId, contactData);
    } else {
      return await this.create({ applicationId: applicationId, ...contactData });
    }
  },

  /**
   * Delete contact info by application ID
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object|null>} Deleted record or null
   */
  async deleteByApplicationId(applicationId) {
    const result = await query(
      'DELETE FROM contact_info WHERE "applicationId" = $1 RETURNING id',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if contact info exists for application
   * @param {string} applicationId - Application UUID
   * @returns {Promise<boolean>} True if exists
   */
  async existsForApplication(applicationId) {
    const result = await query(
      'SELECT id FROM contact_info WHERE "applicationId" = $1',
      [applicationId]
    );
    return result.rows.length > 0;
  },

  /**
   * Find by email
   * @param {string} email - Email address
   * @returns {Promise<Array>} Array of contact info records
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM contact_info WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows;
  },

  /**
   * Find by phone number
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Array>} Array of contact info records
   */
  async findByPhoneNumber(phoneNumber) {
    const result = await query(
      'SELECT * FROM contact_info WHERE "phoneNumber" = $1 OR "alternatePhone" = $1',
      [phoneNumber]
    );
    return result.rows;
  },

  /**
   * Find by digital address
   * @param {string} digitalAddress - Digital address (e.g., GH-123-456)
   * @returns {Promise<Object|null>} Contact info record or null
   */
  async findByDigitalAddress(digitalAddress) {
    const result = await query(
      'SELECT * FROM contact_info WHERE "digitalAddress" = $1',
      [digitalAddress]
    );
    return result.rows[0] || null;
  }
};

module.exports = ContactInfoModel;
