/**
 * responseHandler.js - Standardized API response wrappers
 */
const { toCamelCase } = require('./transformers');

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: toCamelCase(data)
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined
  });
};

/**
 * Validation error response - returns 400 with validation errors array
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [{ message: errors }]
  });
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: toCamelCase(data),
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse
};
