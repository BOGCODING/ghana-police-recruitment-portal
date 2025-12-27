const { errorResponse } = require('../utils/responseHandler');
const { ADMIN_ROLES } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Role-based access control middleware
 * Checks if the authenticated admin has one of the allowed roles
 * @param {...string} allowedRoles - List of roles that can access the route
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    if (!allowedRoles.includes(req.admin.role)) {
      logger.warn(`Access denied: ${req.admin.email} (${req.admin.role}) attempted to access ${req.originalUrl}`);
      return errorResponse(res, 'Access denied: Insufficient permissions', 403);
    }
    
    next();
  };
};

/**
 * Super admin only middleware
 */
const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return errorResponse(res, 'Authentication required', 401);
  }
  
  if (req.admin.role !== ADMIN_ROLES.SUPER_ADMIN) {
    logger.warn(`Super admin access denied: ${req.admin.email} (${req.admin.role}) attempted to access ${req.originalUrl}`);
    return errorResponse(res, 'Access denied: Super admin privileges required', 403);
  }
  
  next();
};

/**
 * Admin or higher middleware (excludes viewers)
 */
const adminOrHigher = (req, res, next) => {
  if (!req.admin) {
    return errorResponse(res, 'Authentication required', 401);
  }
  
  const allowedRoles = [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.MODERATOR, ADMIN_ROLES.REGIONAL_ADMIN];
  
  if (!allowedRoles.includes(req.admin.role)) {
    logger.warn(`Admin access denied: ${req.admin.email} (${req.admin.role}) attempted to access ${req.originalUrl}`);
    return errorResponse(res, 'Access denied: Admin privileges required', 403);
  }
  
  next();
};

/**
 * Regional admin access check
 * Verifies admin has access to the specified region
 */
const hasRegionalAccess = (regionField = 'region') => {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    // Super admins have access to all regions
    if (req.admin.role === ADMIN_ROLES.SUPER_ADMIN) {
      return next();
    }
    
    // Get region from params, query, or body
    const region = req.params[regionField] || req.query[regionField] || req.body?.[regionField];
    
    if (!region) {
      return next(); // No region specified, allow through
    }
    
    // Check if admin has access to this region
    const adminRegions = req.admin.assignedRegions || [];
    
    if (adminRegions.length > 0 && !adminRegions.includes(region)) {
      logger.warn(`Regional access denied: ${req.admin.email} attempted to access region ${region}`);
      return errorResponse(res, 'Access denied: You do not have access to this region', 403);
    }
    
    next();
  };
};

/**
 * Voucher manager or higher middleware
 */
const voucherManagerOnly = (req, res, next) => {
  if (!req.admin) {
    return errorResponse(res, 'Authentication required', 401);
  }
  
  const allowedRoles = [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.VOUCHER_MANAGER];
  
  if (!allowedRoles.includes(req.admin.role)) {
    logger.warn(`Voucher access denied: ${req.admin.email} (${req.admin.role}) attempted to access ${req.originalUrl}`);
    return errorResponse(res, 'Access denied: Voucher manager privileges required', 403);
  }
  
  next();
};

/**
 * Check if user owns the resource or is admin
 * Useful for endpoints where users can access their own data
 */
const ownerOrAdmin = (userIdField = 'id') => {
  return (req, res, next) => {
    // Admins always have access
    if (req.admin) {
      return next();
    }
    
    // Regular users must own the resource
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    const resourceUserId = req.params[userIdField] || req.query[userIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      logger.warn(`Owner access denied: User ${req.user.id} attempted to access resource owned by ${resourceUserId}`);
      return errorResponse(res, 'Access denied: You can only access your own resources', 403);
    }
    
    next();
  };
};

/**
 * Any authenticated user (applicant or admin)
 */
const anyAuthenticated = (req, res, next) => {
  if (!req.user && !req.admin) {
    return errorResponse(res, 'Authentication required', 401);
  }
  next();
};

module.exports = {
  roleMiddleware,
  superAdminOnly,
  adminOrHigher,
  hasRegionalAccess,
  voucherManagerOnly,
  ownerOrAdmin,
  anyAuthenticated
};
