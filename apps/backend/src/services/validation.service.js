const Joi = require('joi');

/**
 * Validation Service - Centralizes Joi validation logic and common schemas
 */
const ValidationService = {
  /**
   * Validate data against a schema
   */
  validate(schema, data) {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => d.message);
      throw new Error(`Validation failed: ${details.join(', ')}`);
    }
    return value;
  },

  /**
   * Common Schemas
   */
  schemas: {
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().regex(/^\+?233[0-9]{9}$|0[0-9]{9}$/).required(),
    uuid: Joi.string().guid({ version: 'uuidv4' }),
    pagination: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(50),
      offset: Joi.number().integer().min(0).default(0)
    })
  }
};

module.exports = ValidationService;
