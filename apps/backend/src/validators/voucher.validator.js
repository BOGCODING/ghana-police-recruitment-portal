const Joi = require('joi');

// Generate single voucher
const generateVoucherSchema = Joi.object({
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().pattern(/^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/).optional(),
  notes: Joi.string().max(500).optional()
});

// Generate bulk vouchers
const bulkVoucherSchema = Joi.object({
  quantity: Joi.number().min(1).max(1000).required()
    .messages({
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Maximum 1000 vouchers can be generated at once'
    }),
  expiryDays: Joi.number().min(1).max(90).default(31),
  notes: Joi.string().max(500).optional()
});

// Validate voucher
const validateVoucherSchema = Joi.object({
  serialNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Serial number is required'
    }),
  pinCode: Joi.string()
    .required()
    .messages({
      'any.required': 'PIN code is required'
    }),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/).required()
});

// Voucher query schema
const voucherQuerySchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
  status: Joi.string().valid('all', 'used', 'unused', 'expired').optional(),
  search: Joi.string().max(100).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

// Purchase voucher schema
const purchaseVoucherSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^(\+233|233|0)\d{9}$/).required()
    .messages({ 'string.pattern.base': 'Invalid Ghana phone number' }),
  paymentMethod: Joi.string().valid('momo', 'card').required(),
  paymentNumber: Joi.string().min(10).max(16).required(),
  quantity: Joi.number().min(1).max(1).default(1) // Limit to 1 for now
});

module.exports = {
  generateVoucherSchema,
  bulkVoucherSchema,
  validateVoucherSchema,
  voucherQuerySchema,
  purchaseVoucherSchema
};
