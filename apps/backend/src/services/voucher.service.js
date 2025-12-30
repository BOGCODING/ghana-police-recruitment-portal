const { Voucher } = require('../models');
const logger = require('../utils/logger');
const { generateSerialNumber, generatePinCode, generateVoucherCode } = require('../utils/generators');
const SystemSetting = require('../models/SystemSetting.model');
const { VOUCHER_EXPIRY_DAYS } = require('../config/constants');

/**
 * Voucher Service - Handles voucher lifecycle and validation
 */
const VoucherService = {
  /**
   * Validate a voucher's serial and PIN
   */
  async validateVoucher(serialNumber, pinCode) {
    try {
      const voucher = await Voucher.findBySerialAndPin(serialNumber, pinCode);
      
      if (!voucher) {
        return { valid: false, message: 'Invalid serial number or PIN code' };
      }

      if (voucher.isUsed) {
        return { valid: false, message: 'This voucher has already been used' };
      }

      if (voucher.deactivatedAt) {
        return { valid: false, message: 'This voucher has been deactivated' };
      }

      const expiryDate = new Date(voucher.expiresAt);
      if (expiryDate < new Date()) {
        return { valid: false, message: `This voucher expired on ${expiryDate.toLocaleDateString()}` };
      }

      // Mark as validated to track attempts (optional)
      await Voucher.markAsValidated(voucher.id);

      return { valid: true, voucher };
    } catch (error) {
      logger.error('Error validating voucher:', error);
      throw error;
    }
  },

  /**
   * List all vouchers with filtering and pagination
   */
  async getAll(filters) {
    try {
      const { page, limit, status, search, startDate, endDate } = filters;
      const offset = (page - 1) * limit;

      const options = {
        limit,
        offset,
        search,
        startDate,
        endDate
      };

      // Map business status to internal filters
      if (status === 'unused') {
        options.isUsed = false;
        options.isExpired = false;
        options.isDeactivated = false;
      } else if (status === 'used') {
        options.isUsed = true;
      } else if (status === 'expired') {
        options.isUsed = false;
        options.isExpired = true;
        options.isDeactivated = false;
      } else if (status === 'deactivated') {
        options.isDeactivated = true;
      }

      const result = await Voucher.findAll(options);
      
      return {
        vouchers: result.rows,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  /**
   * Get voucher statistics
   */
  async getStats() {
    try {
      const stats = await Voucher.countByStatus();
      
      // Get price for revenue calculations
      let voucherPrice = 100;
      try {
        const price = await SystemSetting.get('voucher_price');
        voucherPrice = price ? parseFloat(price) : 100;
      } catch (priceError) {
        logger.warn('Failed to get voucher price, using default');
      }

      // Calculate availability and active counts (consistent with refined logic)
      const available = stats.unused;
      const active = stats.total - stats.deactivated;

      return {
        ...stats,
        available,
        active,
        voucherPrice,
        totalRevenue: active * voucherPrice,
        realizedRevenue: stats.used * voucherPrice
      };
    } catch (error) {
      logger.error('Error getting voucher stats:', error);
      throw error;
    }
  },

  /**
   * Mark a voucher as used and associate with applicant
   */
  async useVoucher(voucherId, applicantId) {
    try {
      const result = await Voucher.markAsUsed(voucherId, applicantId);
      if (result) {
        logger.info(`Voucher ${voucherId} marked as used by applicant ${applicantId}`);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to mark voucher ${voucherId} as used:`, error);
      throw error;
    }
  },

  /**
   * Purchase a voucher (Simulated)
   */
  async purchaseVoucher(purchaseData) {
    try {
      const { email, phoneNumber, firstName, lastName, paymentMethod, paymentNumber } = purchaseData;
      
      // Simulation of payment gateway interaction
      logger.info(`Simulating ${paymentMethod} payment for ${email} from ${paymentNumber}`);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (VOUCHER_EXPIRY_DAYS || 30));

      const voucherData = {
        code: generateVoucherCode(),
        serialNumber: generateSerialNumber(),
        pinCode: generatePinCode(),
        email: email.toLowerCase(),
        phoneNumber,
        expiresAt,
        notes: `Online Purchase by ${firstName} ${lastName}`
      };

      const voucher = await Voucher.create(voucherData);
      
      logger.info(`Voucher purchased successfully for ${email}`);
      return voucher;
    } catch (error) {
      logger.error('Error purchasing voucher:', error);
      throw error;
    }
  },

  /**
   * Generate a single voucher (Admin)
   */
  async generateSingle(adminId, data) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (VOUCHER_EXPIRY_DAYS || 30));

      const voucherData = {
        code: generateVoucherCode(),
        serialNumber: generateSerialNumber(),
        pinCode: generatePinCode(),
        email: data.email,
        phoneNumber: data.phoneNumber,
        expiresAt,
        generatedBy: adminId,
        notes: data.notes || `Generated by admin ${adminId}`
      };

      const voucher = await Voucher.create(voucherData);

      // If email provided, send credentials (non-blocking)
      if (data.email) {
        try {
          // Use lazy require to avoid circular dependencies if any
          const { sendVoucherCredentials } = require('./email.service');
          await sendVoucherCredentials(data.email, {
            serialNumber: voucherData.serialNumber,
            pinCode: voucherData.pinCode,
            expiresAt
          });
          logger.info(`Voucher credentials sent to ${data.email}`);
        } catch (emailError) {
          // Log error but don't fail the voucher generation
          logger.warn(`Failed to send voucher email to ${data.email}: ${emailError.message}`);
        }
      }

      return voucher;
    } catch (error) {
      logger.error('Error generating single voucher:', error);
      throw error;
    }
  },

  /**
   * Bulk generate vouchers for admins
   */
  async generateBatch(adminId, count, expiresAt, notes = null) {
    try {
      const vouchers = [];
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 31); // Default 31 days

      for (let i = 0; i < count; i++) {
        vouchers.push({
          code: generateVoucherCode(),
          serialNumber: generateSerialNumber(),
          pinCode: generatePinCode(),
          expiresAt: expiresAt || defaultExpiry,
          notes: notes || `Batch generated by admin ${adminId}`
        });
      }

      const results = await Voucher.createBatch(vouchers, adminId);
      logger.info(`Batch of ${count} vouchers generated by admin ${adminId}`);
      return results;
    } catch (error) {
      logger.error('Error generating voucher batch:', error);
      throw error;
    }
  },

  /**
   * Deactivate a voucher
   */
  async deactivate(code, adminId) {
    try {
      const voucher = await Voucher.findByCode(code.toUpperCase());
      if (!voucher) throw new Error('Voucher not found');
      if (voucher.isUsed) throw new Error('Cannot deactivate a used voucher');
      if (voucher.deactivatedAt) throw new Error('Voucher is already deactivated');

      return await Voucher.deactivate(voucher.id, adminId);
    } catch (error) {
      logger.error(`Error deactivating voucher ${code}:`, error);
      throw error;
    }
  },

  /**
   * Delete a voucher
   */
  async delete(code) {
    try {
      const voucher = await Voucher.findByCode(code.toUpperCase());
      if (!voucher) throw new Error('Voucher not found');
      
      return await Voucher.delete(voucher.id);
    } catch (error) {
      logger.error(`Error deleting voucher ${code}:`, error);
      throw error;
    }
  }
};

module.exports = VoucherService;

