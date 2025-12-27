const AuditLog = require('../models/AuditLog.model');
const logger = require('../utils/logger');

/**
 * Audit Service - Handles application auditing and activity tracking
 */
const AuditService = {
  /**
   * Log an action to the database
   * @param {Object} data - Audit data (action, entity_type, entity_id, user_id, etc.)
   */
  async log(data) {
    try {
      const log = await AuditLog.logAction(data);
      
      // Alert on critical or failure actions
      if (data.action && (data.action.includes('FAILURE') || data.action.includes('CRITICAL') || data.action.includes('DELETE'))) {
        logger.warn(`Audit Alert: ${data.action} | User: ${data.userId || 'System'} | Entity: ${data.entityType}:${data.entityId}`);
      }
      
      return log;
    } catch (error) {
      // We don't throw here to prevent auditing from breaking the main flow
      logger.error(`Audit logging failed for action ${data.action}:`, error);
      return null;
    }
  },

  /**
   * Get all audit logs with pagination and filters (Admin)
   * @param {Object} options - Search/filter options
   */
  async getAllLogs(options) {
    try {
      return await AuditLog.findAll(options);
    } catch (error) {
      logger.error('Error in getAllLogs:', error);
      throw error;
    }
  },

  /**
   * Get audit history for a specific record
   * @param {string} entityType - Type of entity
   * @param {string} entityId - ID of entity
   */
  async getEntityLogs(entityType, entityId) {
    try {
      return await AuditLog.findByEntity(entityType, entityId);
    } catch (error) {
      logger.error(`Error in getEntityLogs for ${entityType}:${entityId}:`, error);
      throw error;
    }
  },

  /**
   * Get audit history for a specific user
   * @param {string} userId - User ID
   * @param {string} userType - Type of user (admin/applicant)
   * @param {number} limit - Result limit
   */
  async getUserLogs(userId, userType = null, limit = 100) {
    try {
      return await AuditLog.findByUser(userId, userType, limit);
    } catch (error) {
      logger.error(`Error in getUserLogs for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get summary of user activity
   * @param {string} userId - User ID
   * @param {number} days - Time period
   */
  async getActivitySummary(userId, days = 30) {
    try {
      return await AuditLog.getUserActivitySummary(userId, days);
    } catch (error) {
      logger.error(`Error in getActivitySummary for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Cleanup old audit logs
   * @param {number} days - Keep logs for this many days
   */
  async cleanupLogs(days = 90) {
    try {
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - days);
      
      const count = await AuditLog.deleteOlderThan(olderThan);
      logger.info(`Audit Cleanup: Deleted ${count} logs older than ${days} days`);
      return count;
    } catch (error) {
      logger.error('Audit cleanup failed:', error);
      throw error;
    }
  }
};

module.exports = AuditService;
