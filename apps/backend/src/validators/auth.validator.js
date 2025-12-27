const Joi = require('joi');

// Ghana phone number pattern
const phonePattern = /^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/;

// Voucher validation schema
const voucherValidationSchema = Joi.object({
  serialNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Serial Number is required'
    }),
  pinCode: Joi.string()
    .required()
    .messages({
      'any.required': 'PIN Code is required'
    }),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(phonePattern).required()
    .messages({
      'string.pattern.base': 'Invalid phone number format. Use +233-XX-XXX-XXXX or 0XX-XXX-XXXX'
    })
});

// Registration schema
const registerSchema = Joi.object({
  serialNumber: Joi.string().required()
    .messages({ 'any.required': 'Serial Number is required' }),
  pinCode: Joi.string().required()
    .messages({
      'any.required': 'PIN code is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Valid email is required',
      'any.required': 'Email is required'
    }),
  phoneNumber: Joi.string().min(10).required()
    .messages({
      'string.min': 'Phone number must be at least 10 digits',
      'any.required': 'Phone number is required'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Passwords do not match'
    })
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({ 'any.required': 'Email is required' }),
  password: Joi.string().required()
    .messages({ 'any.required': 'Password is required' })
});

// Refresh token schema - token is optional in body since it can come from httpOnly cookie
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional()
});

// Forgot password schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// Reset password schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

module.exports = {
  voucherValidationSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
