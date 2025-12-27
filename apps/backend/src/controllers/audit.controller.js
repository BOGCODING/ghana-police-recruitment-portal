const { query } = require('../config/database');
const { errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { parsePagination } = require('../utils/helpers');
const logger = require('../utils/logger');

const AuditController = {
  async getLogs(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const { action, entityType, search, startDate, endDate } = req.query;
      
      let whereClause = '1=1';
      const values = [];
      let paramCount = 1;
      
      if (action) {
        whereClause += ` AND action = $${paramCount++}`;
        values.push(action);
      }
      
      if (entityType) {
        whereClause += ` AND "entityType" = $${paramCount++}`;
        values.push(entityType);
      }
      
      if (startDate) {
        whereClause += ` AND "createdAt" >= $${paramCount++}`;
        values.push(startDate);
      }
      
      if (endDate) {
        whereClause += ` AND "createdAt" <= $${paramCount++}`;
        values.push(endDate);
      }
      
      if (search) {
        whereClause += ` AND (details::text ILIKE $${paramCount} OR "userId"::text ILIKE $${paramCount})`;
        values.push(`%${search}%`);
        paramCount++;
      }
      
      const countResult = await query(
        `SELECT COUNT(*) FROM audit_logs WHERE ${whereClause}`,
        values
      );
      
      const total = parseInt(countResult.rows[0].count);
      
      values.push(limit, offset);
      
      const result = await query(
        `SELECT * FROM audit_logs 
         WHERE ${whereClause} 
         ORDER BY "createdAt" DESC 
         LIMIT $${paramCount++} OFFSET $${paramCount}`,
        values
      );
      
      return paginatedResponse(res, result.rows, { page, limit, total });
    } catch (error) {
      logger.error('Get audit logs error:', error);
      return errorResponse(res, 'Failed to get audit logs', 500);
    }
  }
};

module.exports = AuditController;
