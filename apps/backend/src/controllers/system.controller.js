const SystemSetting = require('../models/SystemSetting.model');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * System Controller - Handles system-wide settings
 */
const systemController = {
  /**
   * Get all system settings
   */
  getSettings: async (req, res) => {
    try {
      const settings = await SystemSetting.getAll();
      return successResponse(res, settings);
    } catch (error) {
      logger.error('Get settings error:', error);
      return errorResponse(res, 'Failed to get system settings', 500);
    }
  },

  /**
   * Update a system setting
   */
  updateSetting: async (req, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key) {
        return errorResponse(res, 'Setting key is required', 400);
      }

      await SystemSetting.upsert(key, value, req.admin.id);
      
      // Audit log the change
      const { query } = require('../config/database');
      await query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('UPDATE_SETTING', 'system_setting', $1, $2, 'admin', $3)`,
        [key, req.admin.id, JSON.stringify({ key, value })]
      );

      return successResponse(res, { key, value }, 'Setting updated successfully');
    } catch (error) {
      logger.error('Update setting error:', error);
      return errorResponse(res, 'Failed to update system setting', 500);
    }
  },

  /**
   * Get dynamic voucher price
   */
  getVoucherPrice: async (req, res) => {
    try {
      const price = await SystemSetting.get('voucher_price');
      return successResponse(res, { price: parseFloat(price) || 100 });
    } catch (error) {
      logger.error('Get voucher price error:', error);
      return errorResponse(res, 'Failed to get voucher price', 500);
    }
  },

  /**
   * Get public-facing settings (no auth required)
   * Returns: announcement_banner, allow_new_registrations, recruitment_status, maintenance_mode
   */
  getPublicSettings: async (req, res) => {
    try {
      const allSettings = await SystemSetting.getAll();
      const publicKeys = [
        'announcement_banner',
        'allow_new_registrations',
        'recruitment_status',
        'maintenance_mode',
        'application_deadline'
      ];
      const publicSettings = allSettings.filter(s => publicKeys.includes(s.key));
      return successResponse(res, publicSettings);
    } catch (error) {
      logger.error('Get public settings error:', error);
      return errorResponse(res, 'Failed to get public settings', 500);
    }
  }
};

module.exports = systemController;
