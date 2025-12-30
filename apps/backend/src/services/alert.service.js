const logger = require('../utils/logger');
const { query } = require('../config/database');

/**
 * Alert Service - Centralized routing for critical security events
 */
class AlertService {
  /**
   * Trigger a security alert
   * @param {string} type - Alert type (e.g., 'SQL_INJECTION_ATTEMPT', 'BRUTE_FORCE_LOGIN')
   * @param {Object} details - Metadata about the event
   * @param {string} severity - 'INFO', 'WARN', 'CRITICAL'
   */
  static async triggerAlert(type, details, severity = 'WARN') {
    const timestamp = new Date().toISOString();
    const alertData = {
      type,
      severity,
      timestamp,
      ...details
    };

    // 1. Log to specialized security logger
    if (severity === 'CRITICAL') {
      logger.error(`[SECURITY_ALERT] [${severity}] ${type}: ${JSON.stringify(details)}`);
    } else {
      logger.warn(`[SECURITY_ALERT] [${severity}] ${type}: ${JSON.stringify(details)}`);
    }

    // 2. Persist to Audit Logs (if database is available)
    try {
      await query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details, "ipAddress", "userAgent")
         VALUES ($1, 'security_alert', $2, $3, $4, $5, $6, $7)`,
        [
          `ALERT_${type}`,
          details.entityId || null,
          details.userId || null,
          details.userType || 'system',
          JSON.stringify(alertData),
          details.ipAddress || '0.0.0.0',
          details.userAgent || 'unknown'
        ]
      );
    } catch (dbError) {
      logger.error('Failed to persist security alert to database:', dbError);
    }

    // 3. Potential for external notification (e.g., Slack, Email, PagerDuty)
    if (severity === 'CRITICAL') {
      this.sendNotification(alertData);
    }

    return alertData;
  }

  /**
   * Dummy notification sender (to be extended)
   */
  static sendNotification(data) {
    // In a real scenario, this would send an email or Slack message
    logger.info(`[SECURITY_NOTIFICATION] Sending critical alert: ${data.type}`);
  }
}

module.exports = AlertService;
