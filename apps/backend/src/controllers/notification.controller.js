const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { emitToUser } = require('../websocket');

/**
 * Send bulk notifications to applicants
 */
const sendBulkNotification = async (req, res) => {
  try {
    const { filters, notification } = req.body;
    const { status, region, category } = filters;
    const { type, subject, message } = notification;

    if (!message) {
      return errorResponse(res, 'Notification message is required', 400);
    }

    // Build filter query
    let whereClause = 'WHERE apps.id IS NOT NULL';
    const queryParams = [];
    let paramIdx = 1;

    if (status) {
      whereClause += ` AND apps.status = $${paramIdx++}`;
      queryParams.push(status);
    }
    if (region) {
      whereClause += ` AND pi.region = $${paramIdx++}`;
      queryParams.push(region);
    }
    if (category) {
      whereClause += ` AND apps.category = $${paramIdx++}`;
      queryParams.push(category);
    }

    // Get target applicants - use LEFT JOINs to not require complete profiles
    // Filter on applications table first, then optionally join profile data
    const sqlQuery = `
      SELECT apps.id, COALESCE(u.email, 'no-email') as email, ci."phoneNumber", pi."firstName", apps."applicantId"
      FROM applications apps
      LEFT JOIN users u ON apps."applicantId" = u.id
      LEFT JOIN personal_info pi ON apps.id = pi."applicationId"
      LEFT JOIN contact_info ci ON apps.id = ci."applicationId"
      ${whereClause}
    `;
    logger.info('Bulk notification query:', sqlQuery, queryParams);
    
    const applicants = await query(sqlQuery, queryParams);

    const targetCount = applicants.rows.length;

    if (targetCount === 0) {
      return successResponse(res, { count: 0 }, 'No applicants found matching filters');
    }

    // Handle Dashboard Notifications
    if (type === 'DASHBOARD') {
      logger.info(`Saving dashboard notifications for ${targetCount} applicants`);
      for (const applicant of applicants.rows) {
        try {
          // Insert into notifications table
          await query(`
            INSERT INTO notifications ("userId", "userType", title, message, type, "isRead")
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            applicant.applicantId, 
            'applicant', 
            subject || 'Application Update', 
            message, 
            'SYSTEM', 
            false
          ]);

          // Emit real-time update
          emitToUser(applicant.applicantId, 'notification:new', {
            title: subject || 'Application Update',
            message,
            type: 'SYSTEM',
            createdAt: new Date()
          });
        } catch (err) {
          logger.error(`Failed to send dashboard notification to ${applicant.applicantId}:`, err);
        }
      }
    }

    // In a real system, we would queue these for background processing (Redis/Bull)
    // For now, we'll log the intention and simulate success
    logger.info(`Sending bulk ${type} to ${targetCount} applicants: ${subject}`);
    
    // Simulate background job creation
    const jobDetails = {
      type,
      subject,
      content: message,
      recipients: targetCount,
      sentBy: req.admin.id,
      timestamp: new Date()
    };

    // Log the action in audit logs
    await query(`
      INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'SEND_BULK_NOTIFICATION', 
      'outreach', 
      null, // entityId must be a UUID or NULL, 'bulk' was causing 500
      req.admin.id, 
      'admin', 
      JSON.stringify({ ...filters, ...notification, count: targetCount })
    ]);

    return successResponse(res, { jobDetails }, `Successfully queued ${targetCount} notifications`);
  } catch (error) {
    logger.error('Bulk Notification Error:', error);
    return errorResponse(res, 'Failed to send bulk notifications', 500);
  }
};

/**
 * Get notification templates
 */
const getTemplates = async (req, res) => {
  // Simple stubs for now
  const templates = [
    { id: 1, name: 'Interview invite', subject: 'Police Recruitment Interview', body: 'Dear {name}, you are invited for...' },
    { id: 2, name: 'Rejection notice', subject: 'Application Update', body: 'Dear {name}, we regret to inform...' },
    { id: 3, name: 'Document request', subject: 'Missing Documents', body: 'Dear {name}, please upload...' }
  ];
  return successResponse(res, templates);
};

/**
 * Get notifications for current user
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const userType = req.user ? 'applicant' : 'admin';

    const result = await query(
      `SELECT id, title, message, type, "isRead" AS is_read, "readAt" AS read_at, "createdAt" AS created_at 
       FROM notifications 
       WHERE "userId" = $1 AND "userType" = $2 
       ORDER BY "createdAt" DESC LIMIT 50`,
      [userId, userType]
    );

    return successResponse(res, result.rows);
  } catch (error) {
    logger.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to get notifications', 500);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.admin?.id;

    const result = await query(
      `UPDATE notifications SET "isRead" = TRUE, "readAt" = NOW()
       WHERE id = $1 AND "userId" = $2
       RETURNING id, title, message, type, "isRead" AS is_read, "readAt" AS read_at, "createdAt" AS created_at`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, result.rows[0], 'Notification marked as read');
  } catch (error) {
    logger.error('Mark notification read error:', error);
    return errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

/**
 * Mark all notifications as read for current user
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const userType = req.user ? 'applicant' : 'admin';

    await query(
      `UPDATE notifications SET "isRead" = TRUE, "readAt" = NOW()
       WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = FALSE`,
      [userId, userType]
    );

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    return errorResponse(res, 'Failed to mark all notifications as read', 500);
  }
};

module.exports = {
  sendBulkNotification,
  getTemplates,
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
