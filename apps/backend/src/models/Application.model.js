const { query, transaction } = require('../config/database');
const applicationIdGenerator = require('../utils/applicationIdGenerator');

/**
 * Application Model - Handles all database operations for applications
 */
const ApplicationModel = {
  /**
   * Find an application by ID
   * @param {string} id - Application UUID
   * @returns {Promise<Object|null>} Application record or null
   */
  async findById(id) {
    const result = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find an application by application ID (e.g., GPS-2024-001234)
   * @param {string} applicationId - Human-readable application ID
   * @returns {Promise<Object|null>} Application record or null
   */
  async findByApplicationId(applicationId) {
    const result = await query(
      'SELECT * FROM applications WHERE "applicationId" = $1',
      [applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find application by applicant ID
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Object|null>} Application record or null
   */
  async findByApplicantId(applicantId) {
    const result = await query(
      'SELECT * FROM applications WHERE "applicantId" = $1',
      [applicantId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find application by applicant ID with full details
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Object|null>} Application with applicant data or null
   */
  async findByApplicantIdWithDetails(applicantId) {
    const result = await query(
      `SELECT app.*, a.email, a."phoneNumber", a."serialNumber"
       FROM applications app
       JOIN applicants a ON app."applicantId" = a.id
       WHERE app."applicantId" = $1`,
      [applicantId]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application record
   */
  async create(applicationData) {
    const {
      applicantId,
      applicationId = null,
      status = 'DRAFT',
      currentStep = 1,
      category = null,
      subCategory = null,
      specialization = null,
      preferredRegion = null,
      alternateRegion = null
    } = applicationData;

    let finalApplicationId = applicationId;
    if (!finalApplicationId) {
      finalApplicationId = await applicationIdGenerator.generate();
    }

    const result = await query(
      `INSERT INTO applications ("applicantId", "applicationId", status, "currentStep", category, "subCategory", specialization, "preferredRegion", "alternateRegion")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [applicantId, finalApplicationId, status, currentStep, category, subCategory, specialization, preferredRegion, alternateRegion]
    );
    return result.rows[0];
  },

  /**
   * Create application with transaction
   * @param {Object} applicationData - Application data
   * @param {Function} additionalOperations - Callback for related operations
   * @returns {Promise<Object>} Created application
   */
  async createWithTransaction(applicationData, additionalOperations = null) {
    return await transaction(async (client) => {
      const {
        applicantId,
        applicationId = null,
        status = 'DRAFT',
        currentStep = 1,
        category = null,
        subCategory = null,
        specialization = null,
        preferredRegion = null,
        alternateRegion = null
      } = applicationData;

      let finalApplicationId = applicationId;
      if (!finalApplicationId) {
        finalApplicationId = await applicationIdGenerator.generate();
      }

      const result = await client.query(
        `INSERT INTO applications ("applicantId", "applicationId", status, "currentStep", category, "subCategory", specialization, "preferredRegion", "alternateRegion")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [applicantId, finalApplicationId, status, currentStep, category, subCategory, specialization, preferredRegion, alternateRegion]
      );

      const application = result.rows[0];

      if (additionalOperations) {
        await additionalOperations(client, application);
      }

      return application;
    });
  },

  /**
   * Update application status
   * @param {string} id - Application UUID
   * @param {string} status - New status
   * @param {string} reviewerId - Reviewer admin UUID
   * @param {string} comments - Review comments
   * @returns {Promise<Object|null>} Updated application or null
   */
  async updateStatus(id, status, reviewerId = null, comments = null) {
    const result = await query(
      `UPDATE applications 
       SET status = $2, "reviewedBy" = $3, "reviewComments" = $4, "reviewedAt" = NOW(), "updatedAt" = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, status, reviewerId, comments]
    );
    return result.rows[0] || null;
  },

  /**
   * Update application step
   * @param {string} id - Application UUID
   * @param {number} step - Current step number
   * @returns {Promise<Object|null>} Updated application or null
   */
  async updateStep(id, step) {
    const result = await query(
      'UPDATE applications SET "currentStep" = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING id, "currentStep"',
      [id, step]
    );
    return result.rows[0] || null;
  },

  /**
   * Update application details
   * @param {string} id - Application UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated application or null
   */
  async update(id, updates) {
    const fieldMapping = {
      status: 'status',
      currentStep: '"currentStep"',
      category: 'category',
      subCategory: '"subCategory"',
      specialization: 'specialization',
      preferredRegion: '"preferredRegion"',
      alternateRegion: '"alternateRegion"',
      categoryDetails: '"categoryDetails"',
      declaration: 'declaration',
      declarationDate: '"declarationDate"',
      reviewComments: '"reviewComments"',
      rejectionReason: '"rejectionReason"',
      requiredDocuments: '"requiredDocuments"',
      documentRequestMessage: '"documentRequestMessage"',
      submittedAt: '"submittedAt"',
      draftData: '"draftData"'
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

    values.push(id);
    
    const result = await query(
      `UPDATE applications SET ${setClauses.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  },

  /**
   * Submit application
   * @param {string} id - Application UUID
   * @param {string} applicationId - Generated application ID
   * @returns {Promise<Object|null>} Updated application or null
   */
  async submit(id, applicationId) {
    const result = await query(
      `UPDATE applications 
       SET status = 'SUBMITTED', "applicationId" = $2, "submittedAt" = NOW(), "updatedAt" = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, applicationId]
    );
    return result.rows[0] || null;
  },

  /**
   * Approve application
   * @param {string} id - Application UUID
   * @param {string} reviewerId - Admin UUID
   * @param {string} comments - Optional comments
   * @returns {Promise<Object|null>} Updated application or null
   */
  async approve(id, reviewerId, comments = null) {
    const result = await query(
      `UPDATE applications 
       SET status = 'APPROVED', "reviewedBy" = $2, "reviewComments" = $3, "reviewedAt" = NOW(), "updatedAt" = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, reviewerId, comments]
    );
    return result.rows[0] || null;
  },

  /**
   * Reject application
   * @param {string} id - Application UUID
   * @param {string} reviewerId - Admin UUID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object|null>} Updated application or null
   */
  async reject(id, reviewerId, reason) {
    const result = await query(
      `UPDATE applications 
       SET status = 'REJECTED', "reviewedBy" = $2, "rejectionReason" = $3, "reviewedAt" = NOW(), "updatedAt" = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, reviewerId, reason]
    );
    return result.rows[0] || null;
  },

  /**
   * Request additional documents
   * @param {string} id - Application UUID
   * @param {Array} requiredDocuments - List of required document types
   * @param {string} message - Request message
   * @returns {Promise<Object|null>} Updated application or null
   */
  async requestDocuments(id, requiredDocuments, message) {
    const result = await query(
      `UPDATE applications 
       SET status = 'DOCUMENTS_REQUIRED', "requiredDocuments" = $2, "documentRequestMessage" = $3, "updatedAt" = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, requiredDocuments, message]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete an application
   * @param {string} id - Application UUID
   * @returns {Promise<Object|null>} Deleted application or null
   */
  async delete(id) {
    const result = await query(
      'DELETE FROM applications WHERE id = $1 RETURNING id, "applicantId", status',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all applications with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { rows, total }
   */
  async findAll(options = {}) {
    const { 
      limit = 20, 
      offset = 0, 
      status = null, 
      category = null,
      region = null,
      search = null,
      sortBy = '"createdAt"',
      sortOrder = 'DESC'
    } = options;
    
    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`app.status = $${paramCount++}`);
      values.push(status);
    }
    
    if (category) {
      conditions.push(`app.category = $${paramCount++}`);
      values.push(category);
    }

    if (region) {
      conditions.push(`app."preferredRegion" = $${paramCount++}`);
      values.push(region);
    }

    if (search) {
      conditions.push(`(a.email ILIKE $${paramCount} OR a."serialNumber" ILIKE $${paramCount} OR app."applicationId" ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const validSortColumns = ['"createdAt"', '"updatedAt"', '"submittedAt"', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : '"createdAt"';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM applications app
       LEFT JOIN applicants a ON app."applicantId" = a.id
       ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const paginationValues = [...values, limit, offset];
    const result = await query(
      `SELECT app.*, a.email, a."phoneNumber", a."serialNumber"
       FROM applications app
       LEFT JOIN applicants a ON app."applicantId" = a.id
       ${whereClause}
       ORDER BY app.${sortColumn} ${order}
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      paginationValues
    );

    return {
      rows: result.rows,
      total
    };
  },

  /**
   * Get applications by status
   * @param {string} status - Application status
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of applications
   */
  async findByStatus(status, limit = 50) {
    const result = await query(
      `SELECT app.*, a.email, a."serialNumber"
       FROM applications app
       JOIN applicants a ON app."applicantId" = a.id
       WHERE app.status = $1
       ORDER BY app."createdAt" DESC
       LIMIT $2`,
      [status, limit]
    );
    return result.rows;
  },

  /**
   * Count applications by status
   * @returns {Promise<Array>} Array of { status, count }
   */
  async countByStatus() {
    const result = await query(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       GROUP BY status 
       ORDER BY status`
    );
    return result.rows;
  },

  /**
   * Count applications by category
   * @returns {Promise<Array>} Array of { category, count }
   */
  async countByCategory() {
    const result = await query(
      `SELECT category, COUNT(*) as count 
       FROM applications 
       WHERE category IS NOT NULL
       GROUP BY category 
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Count applications by region
   * @returns {Promise<Array>} Array of { region, count }
   */
  async countByRegion() {
    const result = await query(
      `SELECT "preferredRegion" as region, COUNT(*) as count 
       FROM applications 
       WHERE "preferredRegion" IS NOT NULL
       GROUP BY "preferredRegion" 
       ORDER BY count DESC`
    );
    return result.rows;
  },

  /**
   * Get total applications count
   * @returns {Promise<number>} Total count
   */
  async count() {
    const result = await query('SELECT COUNT(*) FROM applications');
    return parseInt(result.rows[0].count);
  },

  /**
   * Get recent applications
   * @param {number} limit - Number of applications to return
   * @returns {Promise<Array>} Array of applications
   */
  async findRecent(limit = 10) {
    const result = await query(
      `SELECT app.*, a.email, a."serialNumber"
       FROM applications app
       JOIN applicants a ON app."applicantId" = a.id
       ORDER BY app."createdAt" DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Get applications submitted within date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of applications
   */
  async findByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT * FROM applications 
       WHERE "submittedAt" >= $1 AND "submittedAt" <= $2
       ORDER BY "submittedAt" DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Get full application with all related data
   * @param {string} id - Application UUID
   * @returns {Promise<Object|null>} Full application data or null
   */
  async findWithFullDetails(id) {
    const appResult = await query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) return null;

    const application = appResult.rows[0];

    // Get related data in parallel
    const [personalInfo, contactInfo, education, documents] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [id]),
      query('SELECT * FROM contact_info WHERE "applicationId" = $1', [id]),
      query('SELECT * FROM education WHERE "applicationId" = $1', [id]),
      query('SELECT * FROM documents WHERE "applicationId" = $1', [id])
    ]);

    return {
      ...application,
      personalInfo: personalInfo.rows[0] || null,
      contactInfo: contactInfo.rows[0] || null,
      education: education.rows[0] || null,
      documents: documents.rows
    };
  },

  /**
   * Generate unique application ID
   * @returns {Promise<string>} Generated application ID
   */
  async generateApplicationId() {
    return await applicationIdGenerator.generate();
  }
};

module.exports = ApplicationModel;
