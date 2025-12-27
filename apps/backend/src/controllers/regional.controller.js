const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { REGIONS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Get all regions
 */
const getAllRegions = async (req, res) => {
  try {
    return successResponse(res, REGIONS);
  } catch (error) {
    logger.error('Get all regions error:', error);
    return errorResponse(res, 'Failed to get regions', 500);
  }
};

/**
 * Get region details with stats
 */
const getRegionDetails = async (req, res) => {
  try {
    const { code } = req.params;
    
    const region = REGIONS.find(r => r.code === code.toUpperCase());
    if (!region) {
      return errorResponse(res, 'Region not found', 404);
    }
    
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'SUBMITTED') as pending,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved
      FROM applications WHERE "preferredRegion" = $1
    `, [code.toUpperCase()]);
    
    return successResponse(res, { ...region, stats: stats.rows[0] });
  } catch (error) {
    logger.error('Get region details error:', error);
    return errorResponse(res, 'Failed to get region details', 500);
  }
};

/**
 * Get applications for a region
 */
const getRegionApplications = async (req, res) => {
  try {
    const { code } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(`
      SELECT app.id, app."applicationId", app.status, app.category, app."createdAt",
             pi."firstName", pi."lastName"
      FROM applications app
      LEFT JOIN personal_info pi ON app.id = pi."applicationId"
      WHERE app."preferredRegion" = $1
      ORDER BY app."createdAt" DESC LIMIT $2 OFFSET $3
    `, [code.toUpperCase(), limit, offset]);
    
    return successResponse(res, result.rows);
  } catch (error) {
    logger.error('Get region applications error:', error);
    return errorResponse(res, 'Failed to get applications', 500);
  }
};

/**
 * Get screening center info
 */
const getScreeningCenter = async (req, res) => {
  try {
    const { code } = req.params;
    const region = REGIONS.find(r => r.code === code.toUpperCase());
    
    if (!region) {
      return errorResponse(res, 'Region not found', 404);
    }
    
    return successResponse(res, {
      name: `${region.name} Screening Center`,
      location: region.capital,
      region: region.name,
      code: region.code
    });
  } catch (error) {
    logger.error('Get screening center error:', error);
    return errorResponse(res, 'Failed to get screening center', 500);
  }
};

/**
 * Get all screening centers
 */
const getAllCenters = async (req, res) => {
  try {
    const centers = REGIONS.map(region => ({
      name: `${region.name} Screening Center`,
      location: region.capital,
      region: region.name,
      code: region.code
    }));
    
    return successResponse(res, centers);
  } catch (error) {
    logger.error('Get all centers error:', error);
    return errorResponse(res, 'Failed to get screening centers', 500);
  }
};

module.exports = { getAllRegions, getRegionDetails, getRegionApplications, getScreeningCenter, getAllCenters };
