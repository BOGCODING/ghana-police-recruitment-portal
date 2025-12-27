const { validationErrorResponse } = require('../utils/responseHandler');

const logger = require('../utils/logger');

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    logger.info(`DEBUG: Validation Middleware Input: ${JSON.stringify(req[property], null, 2)}`);
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      logger.error(`Validation failed for ${property}: ${JSON.stringify(errors)}`);
      return validationErrorResponse(res, errors);
    }
    
    // Replace with validated/sanitized values
    req[property] = value;
    next();
  };
};

/**
 * Validate query params
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate route params
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Validate body
 */
const validateBody = (schema) => validate(schema, 'body');

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateBody
};
