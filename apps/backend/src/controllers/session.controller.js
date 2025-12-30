const { getRedis, cacheGet, cacheDelete } = require('../config/redis');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Get all active admin sessions
 */
const getActiveSessions = async (req, res) => {
  try {
    const redis = getRedis();
    if (!redis) {
      return errorResponse(res, 'Redis is not available', 503);
    }

    // Use keys to find admin sessions
    // In production with millions of keys, use SCAN instead
    const keys = await redis.keys('admin_session:*');
    
    if (keys.length === 0) {
      return successResponse(res, [], 'No active sessions found');
    }

    const sessions = [];
    for (const key of keys) {
      const data = await cacheGet(key);
      if (data) {
        sessions.push(data); // cacheGet already handles JSON.parse
      }
    }

    // Sort by login time (desc)
    sessions.sort((a, b) => new Date(b.loginAt) - new Date(a.loginAt));

    return successResponse(res, sessions);
  } catch (error) {
    logger.error('Get Active Sessions Error:', error);
    return errorResponse(res, 'Failed to fetch active sessions', 500);
  }
};

/**
 * Terminate a specific session
 */
const terminateSession = async (req, res) => {
  try {
    const { adminId, sessionId } = req.params;
    const redis = getRedis();
    
    if (!redis) {
      return errorResponse(res, 'Redis is not available', 503);
    }

    const key = `admin_session:${adminId}:${sessionId}`;
    const deleted = await cacheDelete(key);

    if (deleted) {
      logger.info(`Session terminated by ${req.admin.email}: ${key}`);
      return successResponse(res, null, 'Session terminated successfully');
    } else {
      return errorResponse(res, 'Session not found or already expired', 404);
    }
  } catch (error) {
    logger.error('Terminate Session Error:', error);
    return errorResponse(res, 'Failed to terminate session', 500);
  }
};

module.exports = {
  getActiveSessions,
  terminateSession
};
