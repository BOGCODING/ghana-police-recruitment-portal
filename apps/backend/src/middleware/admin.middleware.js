const { verifyAccessToken } = require('../config/jwt');
const { errorResponse } = require('../utils/responseHandler');
const { query } = require('../config/database');
const { ADMIN_ROLES } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Authenticate admin JWT token
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.adminAccessToken;
    const finalToken = token || cookieToken;
    
    if (!finalToken) {
      logger.warn(`Admin 401: No token found. Cookies: ${Object.keys(req.cookies || {}).join(', ')}`);
      return errorResponse(res, 'Admin access token required', 401);
    }
    
    let decoded;
    try {
      decoded = verifyAccessToken(finalToken);
    } catch (err) {
      logger.warn(`Admin 401: Token verification failed: ${err.message}`);
      return errorResponse(res, 'Invalid or expired admin token', 401);
    }
    
    if (!decoded || decoded.type !== 'admin') {
      logger.warn(`Admin 401: Token is not an admin token. Type: ${decoded?.type}`);
      return errorResponse(res, 'Invalid admin token', 401);
    }
    
    // Verify admin exists and is active (use camelCase column names)
    const result = await query(
      `SELECT id, email, role, "isActive", "assignedRegions"
       FROM admins WHERE id = $1`,
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Admin not found', 401);
    }
    
    const admin = result.rows[0];
    
    if (!admin.isActive) {
      return errorResponse(res, 'Admin account is disabled', 403);
    }
    
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      assignedRegions: admin.assignedRegions || [],
      type: 'admin'
    };
    
    next();
  } catch (error) {
    return errorResponse(res, 'Admin authentication failed', 401);
  }
};

/**
 * Check if admin has required role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
    
    next();
  };
};

/**
 * Super Admin only
 */
const superAdminOnly = requireRole(ADMIN_ROLES.SUPER_ADMIN);

/**
 * Can manage applications (Super Admin, Moderator)
 */
const canManageApplications = requireRole(
  ADMIN_ROLES.SUPER_ADMIN,
  ADMIN_ROLES.MODERATOR
);

/**
 * Can view data (all roles except voucher manager)
 */
const canViewData = requireRole(
  ADMIN_ROLES.SUPER_ADMIN,
  ADMIN_ROLES.MODERATOR,
  ADMIN_ROLES.VIEWER,
  ADMIN_ROLES.REGIONAL_ADMIN
);

/**
 * Can manage vouchers
 */
const canManageVouchers = requireRole(
  ADMIN_ROLES.SUPER_ADMIN,
  ADMIN_ROLES.VOUCHER_MANAGER
);

/**
 * Check regional access for admin
 */
const checkRegionalAccess = async (req, res, next) => {
  if (req.admin.role === ADMIN_ROLES.SUPER_ADMIN) {
    return next(); // Super admin has access to all regions
  }
  
  const regionCode = req.params.regionCode || req.body.regionCode || req.query.region;
  
  if (!regionCode) {
    return next(); // No region specified, continue
  }
  
  if (req.admin.assignedRegions && 
      req.admin.assignedRegions.length > 0 && 
      !req.admin.assignedRegions.includes(regionCode)) {
    return errorResponse(res, 'Access denied for this region', 403);
  }
  
  next();
};

module.exports = {
  authenticateAdmin,
  requireRole,
  superAdminOnly,
  canManageApplications,
  canViewData,
  canManageVouchers,
  checkRegionalAccess
};
