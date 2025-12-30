const { query, transaction } = require('../config/database');
const { generateVoucherCode, generatePinCode, generateSerialNumber } = require('../utils/generators');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { parsePagination, toUpperCase } = require('../utils/helpers');
const { VOUCHER_EXPIRY_DAYS } = require('../config/constants');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');
const { sendVoucherCredentials } = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Check voucher validity (public)
 */
const checkVoucher = async (req, res) => {
  try {
    const { serialNumber, pinCode, email, phoneNumber } = req.body;
    
    const cleanSerial = serialNumber?.trim();
    const cleanPin = pinCode?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phoneNumber?.trim();
    
    const result = await query(
      `SELECT id, code, "expiresAt", "isUsed", email, "phoneNumber", "deactivatedAt"
       FROM vouchers WHERE "serialNumber" = $1 AND "pinCode" = $2`,
      [toUpperCase(cleanSerial), toUpperCase(cleanPin)]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Voucher not found', 404);
    }
    
    const voucher = result.rows[0];

    // Check if deactivated
    if (voucher.deactivatedAt) {
      return errorResponse(res, 'This voucher has been deactivated', 400);
    }

    // Verify assigned email if present
    if (voucher.email && voucher.email.toLowerCase() !== cleanEmail) {
      return errorResponse(res, 'Voucher is assigned to a different email address', 400);
    }

    // Verify assigned phone number if present
    if (voucher.phoneNumber && voucher.phoneNumber !== cleanPhone) {
      return errorResponse(res, 'Voucher is assigned to a different phone number', 400);
    }
    
    if (voucher.isUsed) {
      return errorResponse(res, 'Voucher has already been used', 400);
    }
    
    if (new Date(voucher.expiresAt) < new Date()) {
      return errorResponse(res, 'Voucher has expired', 400);
    }
    
    return successResponse(res, {
      code: voucher.code,
      serialNumber: cleanSerial,
      pinCode: cleanPin,
      isValid: true,
      expiresAt: voucher.expiresAt
    }, 'Voucher is valid');
    
  } catch (error) {
    logger.error('Check voucher error:', error);
    return errorResponse(res, 'Failed to check voucher', 500);
  }
};

/**
 * Generate single voucher (admin)
 */
const generateVoucher = async (req, res) => {
  try {
    const { email, phoneNumber, notes } = req.body;
    
    let code;
    let isUnique = false;
    
    // Generate unique code
    while (!isUnique) {
      code = generateVoucherCode();
      const existing = await query('SELECT id FROM vouchers WHERE code = $1', [code]);
      isUnique = existing.rows.length === 0;
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + VOUCHER_EXPIRY_DAYS);
    
    // Generate other required fields
    const pinCode = generatePinCode();
    const serialNumber = generateSerialNumber();
    
    const result = await query(
      `INSERT INTO vouchers (code, email, "phoneNumber", "expiresAt", notes, "generatedBy", "pinCode", "serialNumber")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, code, "pinCode", "serialNumber", "expiresAt", "createdAt"`,
      [code, email?.toLowerCase(), phoneNumber, expiresAt, notes, req.admin.id, pinCode, serialNumber]
    );
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('GENERATE_VOUCHER', 'voucher', $1, $2, 'admin', $3)`,
      [result.rows[0].id, req.admin.id, JSON.stringify({ code })]
    );
    
    const voucher = result.rows[0];
    
    // Send email with credentials if email is provided
    if (email) {
      sendVoucherCredentials(email.toLowerCase(), {
        serialNumber: voucher.serialNumber,
        pinCode: voucher.pinCode,
        expiresAt: voucher.expiresAt
      }).catch(err => logger.error('Failed to send voucher email:', err));
    }
    
    return successResponse(res, voucher, 'Voucher generated successfully', 201);
    
  } catch (error) {
    logger.error('Generate voucher error:', error);
    return errorResponse(res, 'Failed to generate voucher', 500);
  }
};

/**
 * Generate bulk vouchers (admin)
 */
const generateBulkVouchers = async (req, res) => {
  try {
    const { quantity, expiryDays, notes } = req.body;
    
    const vouchers = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiryDays || VOUCHER_EXPIRY_DAYS));
    
    await transaction(async (client) => {
      for (let i = 0; i < quantity; i++) {
        let code;
        let isUnique = false;
        
        while (!isUnique) {
          code = generateVoucherCode();
          const existing = await client.query('SELECT id FROM vouchers WHERE code = $1', [code]);
          isUnique = existing.rows.length === 0;
        }
        
        const pinCode = generatePinCode();
        const serialNumber = generateSerialNumber();
        
        const result = await client.query(
          `INSERT INTO vouchers (code, "expiresAt", notes, "generatedBy", "pinCode", "serialNumber")
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, code, "pinCode", "serialNumber", "expiresAt"`,
          [code, expiresAt, notes, req.admin.id, pinCode, serialNumber]
        );
        
        vouchers.push(result.rows[0]);
      }
      
      // Audit log
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('BULK_GENERATE_VOUCHERS', 'voucher', NULL, $1, 'admin', $2)`,
        [req.admin.id, JSON.stringify({ quantity, expiryDays })]
      );
    });
    
    return successResponse(res, {
      count: vouchers.length,
      vouchers: vouchers,
      expiresAt
    }, `${quantity} vouchers generated successfully`, 201);
    
  } catch (error) {
    logger.error('Bulk generate vouchers error:', error);
    return errorResponse(res, 'Failed to generate vouchers', 500);
  }
};

/**
 * Export vouchers to CSV
 */
const exportToCSV = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;
    
    if (status === 'unused') {
      whereClause += ' AND "isUsed" = false AND "deactivatedAt" IS NULL AND "expiresAt" > NOW()';
    } else if (status === 'used') {
      whereClause += ' AND "isUsed" = true';
    } else if (status === 'deactivated') {
      whereClause += ' AND "deactivatedAt" IS NOT NULL';
    }
    
    if (startDate) {
      whereClause += ` AND "createdAt" >= $${paramCount++}`;
      values.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND "createdAt" <= $${paramCount++}`;
      values.push(endDate);
    }
    
    const result = await query(
      `SELECT code, email, "phoneNumber", "serialNumber", "pinCode", 
              "isUsed", "expiresAt", "createdAt", "deactivatedAt"
       FROM vouchers WHERE ${whereClause}
       ORDER BY "createdAt" DESC`,
      values
    );
    
    const csvPath = path.join(__dirname, '../../uploads/temp', `vouchers_${Date.now()}.csv`);
    
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'code', title: 'Voucher Code' },
        { id: 'serialNumber', title: 'Serial Number' },
        { id: 'pinCode', title: 'PIN Code' },
        { id: 'email', title: 'Email' },
        { id: 'phoneNumber', title: 'Phone Number' },
        { id: 'isUsed', title: 'Used' },
        { id: 'expiresAt', title: 'Expires At' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'deactivatedAt', title: 'Deactivated At' }
      ]
    });
    
    await csvWriter.writeRecords(result.rows);
    
    res.download(csvPath, 'vouchers.csv', (err) => {
      // Delete temp file after download
      fs.unlink(csvPath, () => {});
      if (err) {
        logger.error('CSV download error:', err);
      }
    });
    
  } catch (error) {
    logger.error('Export vouchers error:', error);
    return errorResponse(res, 'Failed to export vouchers', 500);
  }
};

/**
 * Get all vouchers
 */
const getAllVouchers = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;
    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;
    
    if (status === 'unused') {
      whereClause += ' AND "isUsed" = false AND "expiresAt" > NOW() AND "deactivatedAt" IS NULL';
    } else if (status === 'used') {
      whereClause += ' AND "isUsed" = true'; // Used vouchers can be deactivated but they are primarily "used"
    } else if (status === 'expired') {
      whereClause += ' AND "isUsed" = false AND "expiresAt" <= NOW() AND "deactivatedAt" IS NULL';
    } else if (status === 'deactivated') {
      whereClause += ' AND "deactivatedAt" IS NOT NULL';
    }
    
    if (search) {
      whereClause += ` AND (code ILIKE $${paramCount} OR email ILIKE $${paramCount} OR "serialNumber" ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    const countResult = await query(
      `SELECT COUNT(*) FROM vouchers WHERE ${whereClause}`,
      values
    );
    
    values.push(limit, offset);
    
    const result = await query(
      `SELECT id, code, "pinCode", email, "phoneNumber", "serialNumber", "isUsed", "expiresAt", "createdAt"
       FROM vouchers WHERE ${whereClause} 
       ORDER BY "createdAt" DESC LIMIT $${paramCount++} OFFSET $${paramCount}`,
      values
    );

    return paginatedResponse(res, result.rows, { page, limit, total: parseInt(countResult.rows[0].count) });
    
  } catch (error) {
    logger.error('Get all vouchers error:', error);
    return errorResponse(res, 'Failed to get vouchers', 500);
  }
};

const SystemSetting = require('../models/SystemSetting.model');

/**
 * Get voucher statistics
 */
const getVoucherStats = async (req, res) => {
  // Default fallback stats for cold start scenarios
  const defaultStats = {
    total: '0',
    used: '0',
    available: '0',
    expired: '0',
    generatedToday: '0',
    usedToday: '0',
    voucherPrice: 100,
    totalRevenue: 0,
    realizedRevenue: 0
  };

  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isUsed" = true) as used,
        COUNT(*) FILTER (WHERE "isUsed" = false AND "expiresAt" > NOW() AND "deactivatedAt" IS NULL) as available,
        COUNT(*) FILTER (WHERE "isUsed" = false AND "expiresAt" <= NOW()) as expired,
        COUNT(*) FILTER (WHERE "deactivatedAt" IS NULL) as active,
        COUNT(*) FILTER (WHERE "deactivatedAt" IS NOT NULL) as deactivated,
        COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours') as "generatedToday",
        COUNT(*) FILTER (WHERE "usedAt" > NOW() - INTERVAL '24 hours') as "usedToday"
      FROM vouchers
    `);
    
    const stats = statsResult.rows[0];
    
    // Get voucher price with fallback
    let voucherPrice = 100;
    try {
      const price = await SystemSetting.get('voucher_price');
      voucherPrice = price ? parseFloat(price) : 100;
    } catch (priceError) {
      logger.warn('Failed to get voucher price, using default:', priceError.message);
    }

    return successResponse(res, {
      ...stats,
      voucherPrice,
      // Total revenue based on non-deactivated vouchers
      totalRevenue: parseInt(stats.active || 0) * voucherPrice,
      realizedRevenue: parseInt(stats.used || 0) * voucherPrice
    });
    
  } catch (error) {
    logger.error('Get voucher stats error:', error);
    // Return default stats instead of error to prevent frontend crash
    return successResponse(res, defaultStats, 'Stats temporarily unavailable - using defaults');
  }
};

/**
 * Get voucher by code
 */
const getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await query(
      `SELECT v.*, a.email as "applicantEmail", a."serialNumber" as "applicantSerial"
       FROM vouchers v
       LEFT JOIN applicants a ON v."applicantId" = a.id
       WHERE v.code = $1`,
      [code.toUpperCase()]
    );
    
    return successResponse(res, result.rows[0]);
    
  } catch (error) {
    logger.error('Get voucher by code error:', error);
    return errorResponse(res, 'Failed to get voucher', 500);
  }
};

/**
 * Deactivate voucher
 */
const deactivateVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Only set deactivatedAt/deactivatedBy, NOT isUsed - they are semantically different
    const result = await query(
      `UPDATE vouchers SET "deactivatedAt" = NOW(), "deactivatedBy" = $1
       WHERE code = $2 AND "isUsed" = false AND "deactivatedAt" IS NULL
       RETURNING *`,
      [req.admin.id, code.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Voucher not found, already used, or already deactivated', 404);
    }
    
    return successResponse(res, result.rows[0], 'Voucher deactivated');
    
  } catch (error) {
    logger.error('Deactivate voucher error:', error);
    return errorResponse(res, 'Failed to deactivate voucher', 500);
  }
};

/**
 * Delete voucher (hard delete)
 */
const deleteVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Check if voucher exists and is unused
    const checkResult = await query(
      'SELECT id, "isUsed" FROM vouchers WHERE code = $1',
      [code.toUpperCase()]
    );
    
    if (checkResult.rows.length === 0) {
      return errorResponse(res, 'Voucher not found', 404);
    }
    
    if (checkResult.rows[0].isUsed) {
      return errorResponse(res, 'Cannot delete a used voucher', 400);
    }
    
    // Proceed with deletion
    await query('DELETE FROM vouchers WHERE code = $1', [code.toUpperCase()]);
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('DELETE_VOUCHER', 'voucher', $1, $2, 'admin', $3)`,
      [checkResult.rows[0].id, req.admin.id, JSON.stringify({ code })]
    );
    
    return successResponse(res, null, 'Voucher deleted successfully');
    
  } catch (error) {
    logger.error('Delete voucher error:', error);
    return errorResponse(res, 'Failed to delete voucher', 500);
  }
};

/**
 * Purchase voucher (public)
 */
const purchaseVoucher = async (req, res) => {
  try {
    const { email, phoneNumber, firstName, lastName, paymentMethod, paymentNumber } = req.body;
    
    // Simulate payment processing
    // In a real app, this would integrate with a payment gateway (e.g., Paystack, Flutterwave)
    logger.info(`Simulating ${paymentMethod} payment for ${email} from ${paymentNumber}`);
    
    // Once payment is "successful", generate the voucher
    let code;
    let isUnique = false;
    
    // Generate unique code
    while (!isUnique) {
      code = generateVoucherCode();
      const existing = await query('SELECT id FROM vouchers WHERE code = $1', [code]);
      isUnique = existing.rows.length === 0;
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + VOUCHER_EXPIRY_DAYS);
    
    const pinCode = generatePinCode();
    const serialNumber = generateSerialNumber();
    
    const result = await query(
      `INSERT INTO vouchers (code, email, "phoneNumber", "expiresAt", notes, "pinCode", "serialNumber")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, code, "pinCode", "serialNumber", "expiresAt"`,
      [
        code, 
        email.toLowerCase(), 
        phoneNumber, 
        expiresAt, 
        `Online Purchase by ${firstName} ${lastName}`, 
        pinCode, 
        serialNumber
      ]
    );
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", details)
       VALUES ('PURCHASE_VOUCHER', 'voucher', $1, $2)`,
      [result.rows[0].id, JSON.stringify({ email, paymentMethod, code })]
    );

    const purchasedVoucher = result.rows[0];
    
    // Send email with voucher details (non-blocking)
    sendVoucherCredentials(email.toLowerCase(), {
      serialNumber: purchasedVoucher.serialNumber,
      pinCode: purchasedVoucher.pinCode,
      expiresAt: purchasedVoucher.expiresAt
    }).catch(err => logger.error('Failed to send purchase confirmation email:', err));
    
    return successResponse(res, purchasedVoucher, 'Voucher purchased successfully', 201);
    
  } catch (error) {
    logger.error('Purchase voucher error:', error);
    return errorResponse(res, 'Failed to purchase voucher', 500);
  }
};

module.exports = {
  checkVoucher,
  purchaseVoucher,
  generateVoucher,
  generateBulkVouchers,
  exportToCSV,
  getAllVouchers,
  getVoucherStats,
  getVoucherByCode,
  deactivateVoucher,
  deleteVoucher
};
