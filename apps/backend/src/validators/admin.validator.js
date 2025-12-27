const Joi = require('joi');
const { ADMIN_ROLES, REGIONS } = require('../config/constants');

// Admin login schema
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Create admin schema
const createAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  role: Joi.string().valid(...Object.values(ADMIN_ROLES)).required(),
  assignedRegions: Joi.array().items(
    Joi.string().valid(...REGIONS.map(r => r.code))
  ).optional(),
  isActive: Joi.boolean().default(true)
});

// Update admin schema
const updateAdminSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  role: Joi.string().valid(...Object.values(ADMIN_ROLES)).optional(),
  assignedRegions: Joi.array().items(
    Joi.string().valid(...REGIONS.map(r => r.code))
  ).optional(),
  isActive: Joi.boolean().optional()
});

// Application action schema (approve/reject)
const applicationActionSchema = Joi.object({
  comments: Joi.string().max(1000).optional(),
  reason: Joi.string().max(500).optional()
});

module.exports = {
  adminLoginSchema,
  createAdminSchema,
  updateAdminSchema,
  applicationActionSchema
};
