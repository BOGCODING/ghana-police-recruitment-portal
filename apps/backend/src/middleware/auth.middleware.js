const { verifyAccessToken } = require('../config/jwt');
const { errorResponse } = require('../utils/responseHandler');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authenticate JWT token for applicants
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // Also check cookie
    const accessTokenCookie = req.cookies?.accessToken;
    const refreshTokenCookie = req.cookies?.refreshToken;
    const finalToken = token || accessTokenCookie;
    
    if (!finalToken) {
      if (accessTokenCookie || refreshTokenCookie) {
        logger.debug(`[Auth] No valid token found despite cookies being present. Access: ${!!accessTokenCookie}, Refresh: ${!!refreshTokenCookie}`);
      }
      return errorResponse(res, 'Access token required', 401);
    }
    
    const decoded = verifyAccessToken(finalToken);
    
    if (!decoded) {
      const source = token ? 'header' : 'cookie';
      logger.warn(`[Auth] Token verification failed from ${source}. Has accessToken cookie: ${!!accessTokenCookie}, Has refreshToken cookie: ${!!refreshTokenCookie}`);
      return errorResponse(res, 'Invalid or expired token', 401);
    }
    
    // Verify user exists in database
    const result = await query(
      'SELECT id, email, "serialNumber", status FROM applicants WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 401);
    }
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      serialNumber: result.rows[0].serialNumber,
      type: 'applicant'
    };
    
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.accessToken;
    const finalToken = token || cookieToken;
    
    if (finalToken) {
      const decoded = verifyAccessToken(finalToken);
      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          type: decoded.type || 'applicant'
        };
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Prevent updates to applications that have already been submitted
 */
const preventSubmittedUpdates = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const { APPLICATION_STATUS } = require('../config/constants');
    
    const result = await query(
      'SELECT status FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }

    if (result.rows[0].status !== APPLICATION_STATUS.DRAFT) {
      logger.warn(`Applicant ${req.user.id} attempted to modify submitted application (${result.rows[0].status})`);
      return errorResponse(res, 'Application cannot be modified after submission', 403);
    }

    next();
  } catch (error) {
    logger.error('Prevent submitted updates middleware error:', error);
    return errorResponse(res, 'Authorization check failed', 500);
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  preventSubmittedUpdates
};
