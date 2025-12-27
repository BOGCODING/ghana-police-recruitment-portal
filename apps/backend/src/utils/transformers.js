/**
 * Transform object keys from snake_case to camelCase
 * @param {Object|Array} data - Object or array of objects to transform
 * @returns {Object|Array} Transformed data
 */
const toCamelCase = (data) => {
  // Handle null/undefined/primitives
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Date objects - return ISO string to prevent serialization issues
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Handle non-object types (string, number, boolean, etc.)
  if (typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }

  // Handle regular objects
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });

    result[camelKey] = toCamelCase(value);
  }

  return result;
};

/**
 * Transform object keys from camelCase to snake_case
 * @param {Object|Array} data - Object or array of objects to transform
 * @returns {Object|Array} Transformed data
 */
const toSnakeCase = (data) => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(toSnakeCase);
  }

  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(value);
  }

  return result;
};

module.exports = {
  toCamelCase,
  toSnakeCase
};
