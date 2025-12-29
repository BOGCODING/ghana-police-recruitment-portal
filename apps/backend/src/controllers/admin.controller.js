const { query, transaction } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/passwordHasher');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { parsePagination, formatDocument } = require('../utils/helpers');
const { ADMIN_ROLES, APPLICATION_STATUS } = require('../config/constants');
// WebSocket lazy-loaded to avoid circular dependency
// const { emitToUser, emitApplicationUpdate } = require('../websocket');
const { cacheGet, cacheSet, cacheDelete } = require('../config/redis');
const { sendApplicationStatusUpdate } = require('../services/email.service');
const ApplicationService = require('../services/application.service');
const logger = require('../utils/logger');

/**
 * Initialize Super Admin (one-time setup)
 */
const initializeSuperAdmin = async (req, res) => {
  try {
    // Check if super admin already exists
    const existing = await query(
      'SELECT id FROM admins WHERE role = $1',
      [ADMIN_ROLES.SUPER_ADMIN]
    );
    
    if (existing.rows.length > 0) {
      return errorResponse(res, 'Super admin already exists', 409);
    }
    
    const email = process.env.SUPER_ADMIN_EMAIL || 'boneforgames@gmail.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Bone@123';
    
    const hashedPassword = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO admins (email, "passwordHash", "firstName", "lastName", role, "isActive")
       VALUES ($1, $2, 'Super', 'Admin', $3, true)
       RETURNING id, email, role`,
      [email, hashedPassword, ADMIN_ROLES.SUPER_ADMIN]
    );
    
    logger.info(`Super admin initialized: ${email}`);
    
    return successResponse(res, {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role
    }, 'Super admin initialized successfully', 201);
    
  } catch (error) {
    logger.error('Super admin initialization error:', error);
    return errorResponse(res, 'Failed to initialize super admin', 500);
  }
};

/**
 * Admin login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await query(
      `SELECT id, email, "passwordHash", "firstName", "lastName", role, "isActive", "assignedRegions"
       FROM admins WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      // Log failed attempt for non-existent user
      logger.warn(`Admin login failed: User not found for email ${email}`);
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    const admin = result.rows[0];
    
    // Check if account is locked (simple 5-minute lockout)
    const lockoutKey = `lockout:admin:${email.toLowerCase()}`;
    const attemptsKey = `attempts:admin:${email.toLowerCase()}`;
    
    const isLocked = await cacheGet(lockoutKey);
    if (isLocked) {
      logger.warn(`Admin account locked attempt: ${email}`);
      return errorResponse(res, 'Account temporarily locked due to multiple failed attempts. Please try again in 5 minutes.', 403);
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    
    if (!isMatch) {
      // Increment failed attempts
      const attempts = (parseInt(await cacheGet(attemptsKey)) || 0) + 1;
      await cacheSet(attemptsKey, attempts, 300); // Reset after 5 mins (300 seconds)
      
      if (attempts >= 5) {
        await cacheSet(lockoutKey, 'true', 300); // Lock for 5 mins
        logger.warn(`Admin account locked: ${email}`);
      }
      
      // Audit log failed attempt
      await query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('LOGIN_FAILURE', 'admin', $1, $1, 'admin', $2)`,
        [admin.id, JSON.stringify({ email, attempts, reason: 'Invalid password' })]
      );

      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Reset attempts on success
    await cacheDelete(attemptsKey);
    await cacheDelete(lockoutKey); // Ensure lockout is cleared if somehow set but password was correct
    
    if (!admin.isActive) {
      // Audit log for disabled account
      await query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('LOGIN_FAILURE', 'admin', $1, $1, 'admin', $2)`,
        [admin.id, JSON.stringify({ email, reason: 'Account disabled' })]
      );
      return errorResponse(res, 'Your account is disabled', 403);
    }
    
    const accessToken = generateAccessToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });
    
    const refreshToken = generateRefreshToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });
    
    // Update last login
    await query('UPDATE admins SET "lastLogin" = NOW() WHERE id = $1', [admin.id]);
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('LOGIN', 'admin', $1, $1, 'admin', $2)`,
      [admin.id, JSON.stringify({ email: admin.email })]
    );
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Mandatory for cross-site cookies
      path: '/'
    };

    res.cookie('adminAccessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000
    });
    
    res.cookie('adminRefreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Cache session in Redis with metadata
    const sessionId = require('crypto').randomBytes(16).toString('hex');
    const sessionData = {
      id: sessionId,
      adminId: admin.id,
      email: admin.email,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'],
      loginAt: new Date().toISOString(),
      role: admin.role
    };
    
    await cacheSet(`admin_session:${admin.id}:${sessionId}`, JSON.stringify(sessionData), 60 * 60 * 24 * 7); // 7 days
    await query(`INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
                 VALUES ('SESSION_START', 'session', $1, $2, 'admin', $3)`,
    [sessionId, admin.id, JSON.stringify(sessionData)]);
    
    return successResponse(res, {
      user: admin,
      accessToken,
      refreshToken
    }, 'Login successful');
    
  } catch (error) {
    logger.error('Admin login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Get current admin info
 */
const getCurrentAdmin = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", "createdAt"
       FROM admins WHERE id = $1`,
      [req.admin.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    return successResponse(res, result.rows[0]);
    
  } catch (error) {
    logger.error('Get current admin error:', error);
    return errorResponse(res, 'Failed to get admin info', 500);
  }
};

/**
 * Admin logout
 */
const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Mandatory for cross-site cookies
      path: '/'
    };
    res.clearCookie('adminAccessToken', cookieOptions);
    res.clearCookie('adminRefreshToken', cookieOptions);
    
    if (req.admin?.id) {
      await cacheDelete(`admin:${req.admin.id}:session`);
    }
    
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Admin logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Refresh admin token
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.adminRefreshToken;
    
    if (!token) {
      logger.warn(`Admin Refresh 401: No refresh token found. Cookies: ${Object.keys(req.cookies || {}).join(', ')}`);
      return errorResponse(res, 'Refresh token required', 401);
    }
    
    const decoded = verifyRefreshToken(token);
    if (!decoded || decoded.type !== 'admin') {
      logger.warn(`Admin Refresh 401: Verification failed or not admin. Decoded: ${JSON.stringify(decoded || {})}`);
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: 'admin'
    });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Mandatory for cross-site cookies
      path: '/'
    };

    logger.info(`Admin token refreshed for ID: ${decoded.id}`);
    res.cookie('adminAccessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000
    });
    
    return successResponse(res, { accessToken: newAccessToken });
    
  } catch (error) {
    logger.error('Admin token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

/**
 * Create new admin
 */
const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, assignedRegions, isActive } = req.body;
    
    // Check if email exists
    const existing = await query('SELECT id FROM admins WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return errorResponse(res, 'Email already exists', 409);
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newAdmin = await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO admins (email, "passwordHash", "firstName", "lastName", role, "assignedRegions", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "createdAt"`,
        [email.toLowerCase(), hashedPassword, firstName, lastName, role, assignedRegions || [], isActive !== false]
      );
      
      // Audit log within transaction
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('CREATE_ADMIN', 'admin', $1, $2, 'admin', $3)`,
        [result.rows[0].id, req.admin.id, JSON.stringify({ email, role })]
      );
      
      return result.rows[0];
    });
    
    return successResponse(res, newAdmin, 'Admin created successfully', 201);
    
  } catch (error) {
    logger.error('Create admin error:', error);
    return errorResponse(res, 'Failed to create admin', 500);
  }
};

/**
 * Get all admins
 */
const getAllAdmins = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    
    const countResult = await query('SELECT COUNT(*) FROM admins');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "lastLogin", "createdAt"
       FROM admins ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return paginatedResponse(res, result.rows, { page, limit, total });
    
  } catch (error) {
    logger.error('Get all admins error:', error);
    return errorResponse(res, 'Failed to get admins', 500);
  }
};

/**
 * Get admin by ID
 */
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT id, email, "firstName", "lastName", role, "assignedRegions", "isActive", "lastLogin", "createdAt"
       FROM admins WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    return successResponse(res, result.rows[0]);
    
  } catch (error) {
    logger.error('Get admin by ID error:', error);
    return errorResponse(res, 'Failed to get admin', 500);
  }
};

/**
 * Update admin
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, assignedRegions, isActive } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email.toLowerCase());
    }
    if (firstName) {
      updates.push(`"firstName" = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`"lastName" = $${paramCount++}`);
      values.push(lastName);
    }
    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (assignedRegions !== undefined) {
      updates.push(`"assignedRegions" = $${paramCount++}`);
      values.push(assignedRegions);
    }
    if (isActive !== undefined) {
      updates.push(`"isActive" = $${paramCount++}`);
      values.push(isActive);
    }
    
    if (updates.length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE admins SET ${updates.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount}
       RETURNING id, email, "firstName", "lastName", role, "assignedRegions", "isActive"`,
      values
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    return successResponse(res, result.rows[0], 'Admin updated successfully');
    
  } catch (error) {
    logger.error('Update admin error:', error);
    return errorResponse(res, 'Failed to update admin', 500);
  }
};

/**
 * Delete admin
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting super admin
    const admin = await query('SELECT id, email, role FROM admins WHERE id = $1', [id]);
    if (admin.rows.length === 0) {
      return errorResponse(res, 'Admin not found', 404);
    }
    if (admin.rows[0].role === ADMIN_ROLES.SUPER_ADMIN) {
      return errorResponse(res, 'Cannot delete super admin', 403);
    }
    
    await transaction(async (client) => {
      // Audit log before deletion
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('DELETE_ADMIN', 'admin', $1, $2, 'admin', $3)`,
        [id, req.admin.id, JSON.stringify({ email: admin.rows[0].email })]
      );
      
      await client.query('DELETE FROM admins WHERE id = $1', [id]);
    });
    
    return successResponse(res, null, 'Admin deleted successfully');
    
  } catch (error) {
    logger.error('Delete admin error:', error);
    return errorResponse(res, 'Failed to delete admin', 500);
  }
};

/**
 * Get all applications - Enhanced with date range, eligibility filter, and photo
 */
const getAllApplications = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, category, region, search, startDate, endDate, gender, minAge, maxAge } = req.query;

    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;
    
    if (status) {
      whereClause += ` AND app.status = $${paramCount++}`;
      values.push(status);
    }
    if (category) {
      whereClause += ` AND app.category = $${paramCount++}`;
      values.push(category);
    }
    if (region) {
      whereClause += ` AND app."preferredRegion" = $${paramCount++}`;
      values.push(region);
    }
    if (gender) {
      whereClause += ` AND pi.gender = $${paramCount++}`;
      values.push(gender);
    }

    if (minAge) {
      whereClause += ` AND pi."dateOfBirth" <= (NOW() - make_interval(years => $${paramCount++}))`;
      values.push(parseInt(minAge));
    }
    if (maxAge) {
      whereClause += ` AND pi."dateOfBirth" >= (NOW() - make_interval(years => $${paramCount++} + 1))`;
      values.push(parseInt(maxAge));
    }
    if (search) {
      whereClause += ` AND (a.email ILIKE $${paramCount} OR app."applicationId" ILIKE $${paramCount} OR pi."firstName" ILIKE $${paramCount} OR pi."lastName" ILIKE $${paramCount} OR a."serialNumber" ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    if (startDate) {
      whereClause += ` AND app."createdAt" >= $${paramCount++}`;
      values.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND app."createdAt" <= $${paramCount++}`;
      values.push(endDate);
    }
    
    // Check regional access
    if (req.admin.role !== ADMIN_ROLES.SUPER_ADMIN && req.admin.assignedRegions?.length > 0) {
      whereClause += ` AND app."preferredRegion" = ANY($${paramCount++})`;
      values.push(req.admin.assignedRegions);
    }
    
    const countResult = await query(
      `SELECT COUNT(*) FROM applications app
       LEFT JOIN applicants a ON app."applicantId" = a.id
       LEFT JOIN personal_info pi ON app.id = pi."applicationId"
       WHERE ${whereClause}`,
      values
    );
    
    values.push(limit, offset);
    
    const result = await query(
      `SELECT app.id, app."applicationId", app.status, app.category, app."preferredRegion",
              app."currentStep", app."submittedAt", app."createdAt",
              a.email, a."phoneNumber", a."serialNumber",
              pi."firstName", pi."lastName", pi."dateOfBirth",
              (SELECT "filePath" FROM documents WHERE "applicationId" = app.id AND "documentType" IN ('PASSPORT_PHOTO', 'passportPhoto') LIMIT 1) as "passportPhotoPath"
       FROM applications app
       LEFT JOIN applicants a ON app."applicantId" = a.id
       LEFT JOIN personal_info pi ON app.id = pi."applicationId"
       WHERE ${whereClause}
       ORDER BY app."createdAt" DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );
    
    return paginatedResponse(res, result.rows.map(row => ({
      ...row,
      passportPhoto: row.passportPhotoPath ? formatDocument({ filePath: row.passportPhotoPath }) : null
    })), { page, limit, total: parseInt(countResult.rows[0].count) });
    
  } catch (error) {
    logger.error('Get all applications error:', error);
    return errorResponse(res, 'Failed to get applications', 500);
  }
};

const EducationModel = require('../models/Education.model');

/**
 * Get application by ID - Enhanced with notes and timeline
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch basic application and applicant info
    const appResult = await query(
      `SELECT app.*, a.email, a."phoneNumber", a."serialNumber"
       FROM applications app
       LEFT JOIN applicants a ON app."applicantId" = a.id
       WHERE app.id::text = $1 
          OR app."applicationId" = $1 
          OR a.id::text = $1 
          OR a."serialNumber" = $1
          OR a.email = $1`,
      [id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const app = appResult.rows[0];
    const appId = app.id;

    // 2. Fetch all related details in parallel including notes and timeline
    const [personalInfo, contactInfo, education, documents, notes, timeline] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM contact_info WHERE "applicationId" = $1', [appId]),
      EducationModel.getFullEducation(appId),
      query('SELECT id, "documentType", filename, "originalName", "filePath", "verificationStatus" FROM documents WHERE "applicationId" = $1', [appId]),

      query(`SELECT n.*, adm."firstName" as "adminFirstName", adm."lastName" as "adminLastName"
             FROM application_notes n
             LEFT JOIN admins adm ON n."adminId" = adm.id
             WHERE n."applicationId" = $1
             ORDER BY n."createdAt" DESC`, [appId]),
      query(`SELECT action, details, "createdAt", "userId"
             FROM audit_logs
             WHERE "entityType" = 'application' AND "entityId" = $1
             ORDER BY "createdAt" DESC
             LIMIT 50`, [appId])
    ]);

    // 3. Assemble full object
    const personal = personalInfo.rows[0] || null;
    const contact = contactInfo.rows[0] || null;

    
    // Find passport photo
    const passportPhoto = documents.rows.find(d => d.documentType === 'PASSPORT_PHOTO' || d.documentType === 'passportPhoto');

    // Generate eligibility report for admin
    const eligibility = ApplicationService.checkEligibility({
      application: app,
      personalInfo: personal,
      education
    });


    const responseData = {
      ...app,
      personalInfo: personal,
      contactInfo: contact || {
        email: app.email,
        phoneNumber: app.phoneNumber
      },
      education: education,
      documents: documents.rows.map(formatDocument),
      passportPhoto: passportPhoto ? formatDocument(passportPhoto) : null,
      notes: notes.rows,
      timeline: timeline.rows,
      eligibility
    };

    return successResponse(res, responseData);
    
  } catch (error) {
    logger.error('Get application by ID error:', error);
    return errorResponse(res, 'Failed to get application', 500);
  }
};

/**
 * Get application notes
 */
const getApplicationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT n.*, adm."firstName" as "adminFirstName", adm."lastName" as "adminLastName"
       FROM application_notes n
       LEFT JOIN admins adm ON n."adminId" = adm.id
       WHERE n."applicationId" = $1
       ORDER BY n."createdAt" DESC`,
      [id]
    );
    
    return successResponse(res, result.rows);
    
  } catch (error) {
    logger.error('Get application notes error:', error);
    return errorResponse(res, 'Failed to get notes', 500);
  }
};

/**
 * Add application note
 */
const addApplicationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPrivate } = req.body;
    
    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Note content is required', 400);
    }
    
    // Verify application exists
    const appCheck = await query('SELECT id FROM applications WHERE id = $1', [id]);
    if (appCheck.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const result = await query(
      `INSERT INTO application_notes ("applicationId", "adminId", content, "isPrivate")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.admin.id, content.trim(), isPrivate || false]
    );
    
    // Get admin name for response
    const adminResult = await query(
      'SELECT "firstName", "lastName" FROM admins WHERE id = $1',
      [req.admin.id]
    );
    
    const note = {
      ...result.rows[0],
      adminFirstName: adminResult.rows[0]?.firstName,
      adminLastName: adminResult.rows[0]?.lastName
    };
    
    return successResponse(res, note, 'Note added successfully', 201);
    
  } catch (error) {
    logger.error('Add application note error:', error);
    return errorResponse(res, 'Failed to add note', 500);
  }
};

/**
 * Delete application note
 */
const deleteApplicationNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    
    // Only allow deleting own notes (unless super admin)
    const noteCheck = await query(
      'SELECT * FROM application_notes WHERE id = $1 AND "applicationId" = $2',
      [noteId, id]
    );
    
    if (noteCheck.rows.length === 0) {
      return errorResponse(res, 'Note not found', 404);
    }
    
    if (noteCheck.rows[0].adminId !== req.admin.id && req.admin.role !== ADMIN_ROLES.SUPER_ADMIN) {
      return errorResponse(res, 'You can only delete your own notes', 403);
    }
    
    await query('DELETE FROM application_notes WHERE id = $1', [noteId]);
    
    return successResponse(res, null, 'Note deleted successfully');
    
  } catch (error) {
    logger.error('Delete application note error:', error);
    return errorResponse(res, 'Failed to delete note', 500);
  }
};

/**
 * Bulk approve applications
 */
const bulkApproveApplications = async (req, res) => {
  try {
    const { applicationIds, comments } = req.body;
    
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return errorResponse(res, 'Application IDs array is required', 400);
    }
    
    if (applicationIds.length > 50) {
      return errorResponse(res, 'Maximum 50 applications can be processed at once', 400);
    }
    
    const results = await transaction(async (client) => {
      const approved = [];
      const failed = [];
      
      for (const appId of applicationIds) {
        try {
          const result = await client.query(
            `UPDATE applications 
             SET status = $1, "reviewedBy" = $2, "reviewedAt" = NOW(), "reviewComments" = $3
             WHERE id = $4 AND status = 'SUBMITTED'
             RETURNING id, "applicationId", "applicantId"`,
            [APPLICATION_STATUS.APPROVED, req.admin.id, comments || 'Bulk approved', appId]
          );
          
          if (result.rows.length > 0) {
            approved.push(result.rows[0]);
            
            // Audit log
            await client.query(
              `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
               VALUES ('APPROVE_APPLICATION', 'application', $1, $2, 'admin', $3)`,
              [appId, req.admin.id, JSON.stringify({ comments: comments || 'Bulk approved', bulk: true })]
            );
          } else {
            failed.push({ id: appId, reason: 'Not found or not in SUBMITTED status' });
          }
        } catch (err) {
          failed.push({ id: appId, reason: err.message });
        }
      }
      
      return { approved, failed };
    });
    
    // Emit notifications to each applicant and update global admin feed
    const { emitToUser, emitApplicationUpdate, emitDashboardRefresh } = require('../websocket');
    
    results.approved.forEach(app => {
      emitToUser(app.applicantId, 'application:status_update', {
        status: APPLICATION_STATUS.APPROVED,
        comments: comments || 'Bulk approved'
      });
      emitApplicationUpdate({ type: 'STATUS_CHANGE', id: app.id, status: APPLICATION_STATUS.APPROVED });
    });

    // Emit dashboard refresh (admin only)
    emitDashboardRefresh();

    return successResponse(res, results, `Approved ${results.approved.length} applications`);
    
  } catch (error) {
    logger.error('Bulk approve error:', error);
    return errorResponse(res, 'Failed to bulk approve applications', 500);
  }
};

/**
 * Bulk reject applications
 */
const bulkRejectApplications = async (req, res) => {
  try {
    const { applicationIds, reason, comments } = req.body;
    
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return errorResponse(res, 'Application IDs array is required', 400);
    }
    
    if (!reason) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }
    
    if (applicationIds.length > 50) {
      return errorResponse(res, 'Maximum 50 applications can be processed at once', 400);
    }
    
    const results = await transaction(async (client) => {
      const rejected = [];
      const failed = [];
      
      for (const appId of applicationIds) {
        try {
          const result = await client.query(
            `UPDATE applications 
             SET status = $1, "reviewedBy" = $2, "reviewedAt" = NOW(), 
                 "reviewComments" = $3, "rejectionReason" = $4
             WHERE id = $5 AND status = 'SUBMITTED'
             RETURNING id, "applicationId", "applicantId"`,
            [APPLICATION_STATUS.REJECTED, req.admin.id, comments || 'Bulk rejected', reason, appId]
          );
          
          if (result.rows.length > 0) {
            rejected.push(result.rows[0]);
            
            // Audit log
            await client.query(
              `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
               VALUES ('REJECT_APPLICATION', 'application', $1, $2, 'admin', $3)`,
              [appId, req.admin.id, JSON.stringify({ reason, comments, bulk: true })]
            );
          } else {
            failed.push({ id: appId, reason: 'Not found or not in SUBMITTED status' });
          }
        } catch (err) {
          failed.push({ id: appId, reason: err.message });
        }
      }
      
      return { rejected, failed };
    });
    
    // Emit notifications to each applicant and update global admin feed
    const { emitToUser, emitApplicationUpdate, emitDashboardRefresh } = require('../websocket');
    
    results.rejected.forEach(app => {
      emitToUser(app.applicantId, 'application:status_update', {
        status: APPLICATION_STATUS.REJECTED,
        reason,
        comments
      });
      emitApplicationUpdate({ type: 'STATUS_CHANGE', id: app.id, status: APPLICATION_STATUS.REJECTED });
    });

    // Emit dashboard refresh (admin only)
    emitDashboardRefresh();

    return successResponse(res, results, `Rejected ${results.rejected.length} applications`);
    
  } catch (error) {
    logger.error('Bulk reject error:', error);
    return errorResponse(res, 'Failed to bulk reject applications', 500);
  }
};

/**
 * Get application timeline/history from audit logs
 */
const getApplicationTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT al.action, al.details, al."createdAt", al."userId",
              adm."firstName" as "adminFirstName", adm."lastName" as "adminLastName"
       FROM audit_logs al
       LEFT JOIN admins adm ON al."userId" = adm.id AND al."userType" = 'admin'
       WHERE al."entityType" = 'application' AND al."entityId" = $1
       ORDER BY al."createdAt" DESC
       LIMIT 100`,
      [id]
    );
    
    // Format timeline entries
    const timeline = result.rows.map(entry => ({
      action: entry.action,
      details: entry.details,
      timestamp: entry.createdAt,
      actor: entry.adminFirstName && entry.adminLastName 
        ? `${entry.adminFirstName} ${entry.adminLastName}`
        : 'System'
    }));
    
    return successResponse(res, timeline);
    
  } catch (error) {
    logger.error('Get application timeline error:', error);
    return errorResponse(res, 'Failed to get timeline', 500);
  }
};

/**
 * Approve application
 */
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    const application = await transaction(async (client) => {
      const result = await client.query(
        `UPDATE applications 
         SET status = $1, "reviewedBy" = $2, "reviewedAt" = NOW(), "reviewComments" = $3
         WHERE id = $4
         RETURNING *`,
        [APPLICATION_STATUS.APPROVED, req.admin.id, comments, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('NOT_FOUND');
      }
      
      // Audit log within transaction
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('APPROVE_APPLICATION', 'application', $1, $2, 'admin', $3)`,
        [id, req.admin.id, JSON.stringify({ comments })]
      );
      
      return result.rows[0];
    });
    
    // Emit notification to user and update global admin feed (outside transaction)
    const { emitToUser, emitApplicationUpdate } = require('../websocket');
    emitToUser(application.applicantId, 'application:status_update', {
      status: APPLICATION_STATUS.APPROVED,
      comments
    });
    emitApplicationUpdate({ type: 'STATUS_CHANGE', id, status: APPLICATION_STATUS.APPROVED });

    // Send status update email
    const applicantResult = await query('SELECT email FROM applicants WHERE id = $1', [application.applicantId]);
    if (applicantResult.rows[0]) {
      sendApplicationStatusUpdate(applicantResult.rows[0].email, {
        applicationId: application.applicationId,
        status: APPLICATION_STATUS.APPROVED,
        message: comments
      }).catch(err => logger.error('Failed to send approval email:', err));
    }

    // Emit dashboard refresh (admin only)
    const { emitDashboardRefresh } = require('../websocket');
    emitDashboardRefresh();

    return successResponse(res, application, 'Application approved successfully');
    
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return errorResponse(res, 'Application not found', 404);
    }
    logger.error('Approve application error:', error);
    return errorResponse(res, 'Failed to approve application', 500);
  }
};

/**
 * Reject application
 */
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments } = req.body;
    
    const application = await transaction(async (client) => {
      const result = await client.query(
        `UPDATE applications 
         SET status = $1, "reviewedBy" = $2, "reviewedAt" = NOW(), 
             "reviewComments" = $3, "rejectionReason" = $4
         WHERE id = $5
         RETURNING *`,
        [APPLICATION_STATUS.REJECTED, req.admin.id, comments, reason, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('NOT_FOUND');
      }
      
      // Audit log within transaction
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('REJECT_APPLICATION', 'application', $1, $2, 'admin', $3)`,
        [id, req.admin.id, JSON.stringify({ reason, comments })]
      );
      
      return result.rows[0];
    });
    
    // Emit notification (outside transaction)
    const { emitToUser, emitApplicationUpdate } = require('../websocket');
    emitToUser(application.applicantId, 'application:status_update', {
      status: APPLICATION_STATUS.REJECTED,
      reason,
      comments
    });
    emitApplicationUpdate({ type: 'STATUS_CHANGE', id, status: APPLICATION_STATUS.REJECTED });

    // Send status update email
    const applicantResult = await query('SELECT email FROM applicants WHERE id = $1', [application.applicantId]);
    if (applicantResult.rows[0]) {
      sendApplicationStatusUpdate(applicantResult.rows[0].email, {
        applicationId: application.applicationId,
        status: APPLICATION_STATUS.REJECTED,
        message: `Reason: ${reason}. ${comments || ''}`
      }).catch(err => logger.error('Failed to send rejection email:', err));
    }

    // Emit dashboard refresh (admin only)
    const { emitDashboardRefresh } = require('../websocket');
    emitDashboardRefresh();

    return successResponse(res, application, 'Application rejected');
    
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return errorResponse(res, 'Application not found', 404);
    }
    logger.error('Reject application error:', error);
    return errorResponse(res, 'Failed to reject application', 500);
  }
};

/**
 * Request additional documents
 */
const requestDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents, message } = req.body;
    
    const application = await transaction(async (client) => {
      const result = await client.query(
        `UPDATE applications 
         SET status = $1, "requiredDocuments" = $2, "documentRequestMessage" = $3
         WHERE id = $4
         RETURNING *`,
        [APPLICATION_STATUS.DOCUMENTS_REQUIRED, documents, message, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('NOT_FOUND');
      }
      
      // Audit log within transaction
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('REQUEST_DOCUMENTS', 'application', $1, $2, 'admin', $3)`,
        [id, req.admin.id, JSON.stringify({ documents, message })]
      );
      
      return result.rows[0];
    });
    
    // Emit notification to user (outside transaction)
    const { emitToUser, emitApplicationUpdate } = require('../websocket');
    emitToUser(application.applicantId, 'application:status_update', {
      status: APPLICATION_STATUS.DOCUMENTS_REQUIRED,
      documents,
      message
    });
    emitApplicationUpdate({ type: 'STATUS_CHANGE', id, status: APPLICATION_STATUS.DOCUMENTS_REQUIRED });

    // Send status update email
    const applicantResult = await query('SELECT email FROM applicants WHERE id = $1', [application.applicantId]);
    if (applicantResult.rows[0]) {
      sendApplicationStatusUpdate(applicantResult.rows[0].email, {
        applicationId: application.applicationId,
        status: APPLICATION_STATUS.DOCUMENTS_REQUIRED,
        message: `Additional documents required: ${documents.join(', ')}. ${message || ''}`
      }).catch(err => logger.error('Failed to send document request email:', err));
    }

    return successResponse(res, application, 'Document request sent');
    
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return errorResponse(res, 'Application not found', 404);
    }
    logger.error('Request documents error:', error);
    return errorResponse(res, 'Failed to request documents', 500);
  }
};

/**
 * Get dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as "totalApplications",
        COUNT(*) FILTER (WHERE status = 'SUBMITTED') as pending,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
        COUNT(*) FILTER (WHERE status = 'DRAFT') as drafts,
        COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours') as today
      FROM applications
    `);
    
    const byCategory = await query(`
      SELECT category, COUNT(*) as count
      FROM applications
      WHERE category IS NOT NULL
      GROUP BY category
    `);
    
    return successResponse(res, {
      overview: stats.rows[0],
      byCategory: byCategory.rows
    });
    
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to get stats', 500);
  }
};

/**
 * Get recent applications
 */
const getRecentApplications = async (req, res) => {
  try {
    const result = await query(`
      SELECT app.id, app."applicationId", app.status, app.category, app."createdAt",
             pi."firstName", pi."lastName",
             (SELECT "filePath" FROM documents WHERE "applicationId" = app.id AND "documentType" IN ('PASSPORT_PHOTO', 'passportPhoto') LIMIT 1) as "passportPhotoPath"
      FROM applications app
      LEFT JOIN personal_info pi ON app.id = pi."applicationId"
      ORDER BY app."createdAt" DESC
      LIMIT 10
    `);
    
    return successResponse(res, result.rows.map(row => ({
      ...row,
      passportPhoto: row.passportPhotoPath ? formatDocument({ filePath: row.passportPhotoPath }) : null
    })));
    
  } catch (error) {
    logger.error('Get recent applications error:', error);
    return errorResponse(res, 'Failed to get recent applications', 500);
  }
};

/**
 * Get pending actions
 */
const getPendingActions = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'SUBMITTED') as "pendingReview",
        COUNT(*) FILTER (WHERE status = 'DOCUMENTS_REQUIRED') as "awaitingDocuments"
      FROM applications
    `);
    
    return successResponse(res, result.rows[0]);
    
  } catch (error) {
    logger.error('Get pending actions error:', error);
    return errorResponse(res, 'Failed to get pending actions', 500);
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { action, entityType, search, startDate, endDate } = req.query;
    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;
    
    if (action) {
      whereClause += ` AND al.action = $${paramCount++}`;
      values.push(action);
    }
    if (entityType) {
      whereClause += ` AND al."entityType" = $${paramCount++}`;
      values.push(entityType);
    }
    if (search) {
      whereClause += ` AND (adm.email ILIKE $${paramCount} OR adm."firstName" ILIKE $${paramCount} OR adm."lastName" ILIKE $${paramCount} OR al."entityId" ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    if (startDate) {
      whereClause += ` AND al."createdAt" >= $${paramCount++}`;
      values.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND al."createdAt" <= $${paramCount++}`;
      values.push(endDate);
    }
    
    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al
       LEFT JOIN admins adm ON al."userId" = adm.id AND al."userType" = 'admin'
       WHERE ${whereClause}`,
      values
    );
    
    const total = parseInt(countResult.rows[0].count);
    values.push(limit, offset);
    
    const result = await query(
      `SELECT al.*, adm.email as "adminEmail", adm."firstName" as "adminFirstName", adm."lastName" as "adminLastName"
       FROM audit_logs al
       LEFT JOIN admins adm ON al."userId" = adm.id AND al."userType" = 'admin'
       WHERE ${whereClause}
       ORDER BY al."createdAt" DESC LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );
    
    return paginatedResponse(res, result.rows, { page, limit, total });
    
  } catch (error) {
    logger.error('Get audit logs error:', error);
    return errorResponse(res, 'Failed to get audit logs', 500);
  }
};

/**
 * Verify individual document
 */
const verifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { status, comments } = req.body;
    
    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return errorResponse(res, 'Invalid verification status', 400);
    }
    
    const result = await query(
      `UPDATE documents 
       SET "verificationStatus" = $1, "verifiedBy" = $2, 
           "verifiedAt" = NOW(), "verificationComments" = $3
       WHERE id = $4 AND "applicationId" = $5
       RETURNING *`,
      [status, req.admin.id, comments, docId, id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Document not found', 404);
    }
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('VERIFY_DOCUMENT', 'document', $1, $2, 'admin', $3)`,
      [docId, req.admin.id, JSON.stringify({ status, comments, applicationId: id })]
    );
    
    return successResponse(res, result.rows[0], `Document ${status.toLowerCase()} successfully`);
    
  } catch (error) {
    logger.error('Verify document error:', error);
    return errorResponse(res, 'Failed to verify document', 500);
  }
};

const XLSX = require('xlsx');

/**
 * Export applications to Excel
 */
const exportApplications = async (req, res) => {
  try {
    const { status, category, region, gender, minAge, maxAge, minHeight } = req.query;
    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;
    
    if (status) {
      whereClause += ` AND app.status = $${paramCount++}`;
      values.push(status);
    }
    if (category) {
      whereClause += ` AND app.category = $${paramCount++}`;
      values.push(category);
    }
    if (region) {
      whereClause += ` AND app."preferredRegion" = $${paramCount++}`;
      values.push(region);
    }
    if (gender) {
      whereClause += ` AND pi.gender = $${paramCount++}`;
      values.push(gender);
    }
    if (minHeight) {
      whereClause += ` AND pa."heightCm" >= $${paramCount++}`;
      values.push(minHeight);
    }
    if (minAge) {
      whereClause += ` AND pi."dateOfBirth" <= (NOW() - make_interval(years => $${paramCount++}))`;
      values.push(parseInt(minAge));
    }
    if (maxAge) {
      whereClause += ` AND pi."dateOfBirth" >= (NOW() - make_interval(years => $${paramCount++} + 1))`;
      values.push(parseInt(maxAge));
    }
    
    const result = await query(
      `SELECT app."applicationId", app.status, app.category, app."submittedAt",
              pi."firstName", pi."lastName", pi."dateOfBirth", pi.gender,
              pa."heightCm", pa."chestSizeCm", pi."regionOfOrigin", pi."hometown",
              a.email, a."phoneNumber", a."serialNumber"
       FROM applications app
       JOIN applicants a ON app."applicantId" = a.id
       JOIN personal_info pi ON app.id = pi."applicationId"
       LEFT JOIN physical_attributes pa ON app.id = pa."applicationId"
       WHERE ${whereClause}
       ORDER BY app."submittedAt" DESC`,
      values
    );

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(result.rows.map(row => ({
      'App ID': row.applicationId,
      'Status': row.status,
      'Category': row.category,
      'First Name': row.firstName,
      'Last Name': row.lastName,
      'DOB': row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : 'N/A',
      'Gender': row.gender,
      'Height (cm)': row.heightCm,
      'Region': row.regionOfOrigin,
      'Email': row.email,
      'Phone': row.phoneNumber,
      'Submitted': row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : 'N/A'
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applications_export.xlsx');
    
    return res.status(200).send(buffer);
    
  } catch (error) {
    logger.error('Export error:', error);
    return errorResponse(res, 'Failed to export applications', 500);
  }
};

module.exports = {
  initializeSuperAdmin,
  login,
  getCurrentAdmin,
  logout,
  refreshToken,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  requestDocuments,
  verifyDocument,
  exportApplications,
  getDashboardStats,
  getRecentApplications,
  getPendingActions,
  getAuditLogs,
  // New functions
  getApplicationNotes,
  addApplicationNote,
  deleteApplicationNote,
  bulkApproveApplications,
  bulkRejectApplications,
  getApplicationTimeline
};

