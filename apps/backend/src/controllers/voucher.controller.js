const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const VoucherService = require('../services/voucher.service');
const VoucherDTO = require('../dtos/Voucher.dto');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

/**
 * Public: Check voucher validity
 */
const checkVoucher = async (req, res) => {
  try {
    const { serialNumber, pinCode } = req.body;
    
    const result = await VoucherService.validateVoucher(serialNumber, pinCode);
    
    if (!result.valid) {
      return errorResponse(res, result.message, 400);
    }
    
    return successResponse(res, VoucherDTO.toVoucherResponse(result.voucher), 'Voucher is valid');
  } catch (error) {
    logger.error('Check voucher error:', error.message);
    return errorResponse(res, 'Failed to check voucher', 500);
  }
};

/**
 * Public: Purchase voucher (simulated)
 */
const purchaseVoucher = async (req, res) => {
  try {
    const input = VoucherDTO.toGenerateSingleInput(req.body);
    const purchaseData = {
      ...input,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      paymentMethod: req.body.paymentMethod,
      paymentNumber: req.body.paymentNumber
    };

    const voucher = await VoucherService.purchaseVoucher(purchaseData);
    
    return successResponse(res, VoucherDTO.toVoucherResponse(voucher), 'Voucher purchased successfully');
  } catch (error) {
    logger.error('Purchase voucher error:', error.message);
    return errorResponse(res, 'Failed to purchase voucher', 500);
  }
};

/**
 * Admin: Generate single voucher
 */
const generateVoucher = async (req, res) => {
  try {
    const input = VoucherDTO.toGenerateSingleInput(req.body);
    const voucher = await VoucherService.generateSingle(req.admin.id, input);
    
    return successResponse(res, VoucherDTO.toVoucherResponse(voucher), 'Voucher generated', 201);
  } catch (error) {
    logger.error('Generate voucher error:', error.message);
    return errorResponse(res, 'Failed to generate voucher', 500);
  }
};

/**
 * Admin: Generate bulk vouchers
 */
const generateBulk = async (req, res) => {
  try {
    const { quantity, expiryDays, notes } = VoucherDTO.toGenerateBulkInput(req.body);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const vouchers = await VoucherService.generateBatch(req.admin.id, quantity, expiresAt, notes);
    
    return successResponse(res, {
      count: vouchers.length,
      expiresAt,
      vouchers: vouchers.map(v => VoucherDTO.toVoucherResponse(v))
    }, `${quantity} vouchers generated successfully`, 201);
  } catch (error) {
    logger.error('Bulk generate error:', error.message);
    return errorResponse(res, 'Failed to generate bulk vouchers', 500);
  }
};

/**
 * Admin: Get all vouchers
 */
const getAllVouchers = async (req, res) => {
  try {
    const filters = VoucherDTO.toQueryFilters(req.query);
    const result = await VoucherService.getAll(filters);
    
    return paginatedResponse(res, 
      result.vouchers.map(v => VoucherDTO.toVoucherResponse(v)),
      result.pagination,
      'Vouchers fetched'
    );
  } catch (error) {
    logger.error('Get all vouchers error:', error.message);
    return errorResponse(res, 'Failed to fetch vouchers', 500);
  }
};

/**
 * Admin: Get stats
 */
const getVoucherStats = async (req, res) => {
  try {
    const stats = await VoucherService.getStats();
    return successResponse(res, stats);
  } catch (error) {
    logger.error('Get stats error:', error.message);
    return errorResponse(res, 'Failed to fetch statistics', 500);
  }
};

/**
 * Admin: Deactivate voucher
 */
const deactivateVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    const voucher = await VoucherService.deactivate(code, req.admin.id);
    
    return successResponse(res, VoucherDTO.toVoucherResponse(voucher), 'Voucher deactivated');
  } catch (error) {
    logger.error('Deactivate error:', error.message);
    return errorResponse(res, error.message, error.message.includes('not found') ? 404 : 400);
  }
};

/**
 * Admin: Delete voucher
 */
const deleteVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    await VoucherService.delete(code);
    
    return successResponse(res, null, 'Voucher deleted permanently');
  } catch (error) {
    logger.error('Delete error:', error.message);
    return errorResponse(res, error.message, 404);
  }
};

/**
 * Admin: Export to CSV
 */
const exportToCSV = async (req, res) => {
  try {
    const filters = VoucherDTO.toQueryFilters(req.query);
    filters.limit = 10000; // Large limit for export
    
    const result = await VoucherService.getAll(filters);
    
    const csvPath = path.join(__dirname, '../../uploads/temp', `vouchers_${Date.now()}.csv`);
    
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'serialNumber', title: 'Serial Number' },
        { id: 'pinCode', title: 'PIN Code' },
        { id: 'code', title: 'Internal Code' },
        { id: 'email', title: 'Target Email' },
        { id: 'phoneNumber', title: 'Target Phone' },
        { id: 'isUsed', title: 'Is Used' },
        { id: 'applicantEmail', title: 'Used By' },
        { id: 'usedAt', title: 'Used At' },
        { id: 'expiresAt', title: 'Expires At' },
        { id: 'deactivatedAt', title: 'Deactivated At' },
        { id: 'createdAt', title: 'Created At' }
      ]
    });

    const data = result.vouchers.map(v => ({
      ...v,
      isUsed: v.isUsed ? 'Yes' : 'No',
      usedAt: v.usedAt ? new Date(v.usedAt).toLocaleString() : '-',
      expiresAt: new Date(v.expiresAt).toLocaleDateString(),
      deactivatedAt: v.deactivatedAt ? new Date(v.deactivatedAt).toLocaleString() : '-',
      createdAt: new Date(v.createdAt).toLocaleString()
    }));

    await csvWriter.writeRecords(data);
    
    res.download(csvPath, 'vouchers.csv', (err) => {
      // Delete temp file after download
      fs.unlink(csvPath, () => {});
      if (err) {
        logger.error('CSV download error:', err);
      }
    });
  } catch (error) {
    logger.error('CSV export error:', error.message);
    return errorResponse(res, 'Failed to export CSV', 500);
  }
};

/**
 * Admin: Get details by code
 */
const getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { Voucher: VoucherModel } = require('../models');
    const voucher = await VoucherModel.findByCode(code.toUpperCase());
    
    if (!voucher) {
      return errorResponse(res, 'Voucher not found', 404);
    }
    
    return successResponse(res, VoucherDTO.toVoucherResponse(voucher));
  } catch (error) {
    logger.error('Get details error:', error.message);
    return errorResponse(res, 'Failed to fetch voucher details', 500);
  }
};

module.exports = {
  checkVoucher,
  purchaseVoucher,
  generateVoucher,
  generateBulk,
  exportToCSV,
  getAllVouchers,
  getVoucherStats,
  deactivateVoucher,
  deleteVoucher,
  getVoucherByCode
};
