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
      // logger.debug(`[Auth] No token found. Cookies: ${Object.keys(req.cookies || {}).join(', ')}`);
      return errorResponse(res, 'Access token required', 401);
    }
    
    const decoded = verifyAccessToken(finalToken);
    
    if (!decoded) {
      logger.warn(`[Auth] Token verification failed. Has accessToken cookie: ${!!accessTokenCookie}, Has refreshToken cookie: ${!!refreshTokenCookie}`);
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

module.exports = {
  authenticateToken,
  optionalAuth
};
