const SystemSetting = require('../models/SystemSetting.model');
const { errorResponse } = require('../utils/responseHandler');

const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip for admin routes and system settings (to allow admins to disable it)
    if (req.originalUrl.startsWith('/api/admin') || 
        req.originalUrl.startsWith('/api/system') ||
        req.originalUrl.startsWith('/api/auth/admin')) {
      return next();
    }

    const isMaintenance = await SystemSetting.get('maintenance_mode');
    
    if (isMaintenance && isMaintenance !== 'false') {
      return errorResponse(res, 'System is currently under maintenance. Please try again later.', 503);
    }

    next();
  } catch (error) {
    console.error('Maintenance check error:', error);
    next(); // Fail open if check fails
  }
};

module.exports = checkMaintenanceMode;
