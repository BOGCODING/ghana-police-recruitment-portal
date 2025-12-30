/**
 * Base Data Transfer Object Class
 * Provides standard methods for cleaning and formatting data
 */
class BaseDTO {
  constructor(data) {
    this.originalData = data;
  }

  /**
   * Filter object to only include allowed keys
   * @param {Object} source - Source object
   * @param {Array} allowedKeys - Array of allowed keys
   * @returns {Object} Filtered object
   */
  static filter(source, allowedKeys) {
    if (!source) return null;
    const filtered = {};
    allowedKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        filtered[key] = source[key];
      }
    });
    return filtered;
  }

  /**
   * Remove sensitive keys from object
   * @param {Object} source - Source object
   * @param {Array} excludedKeys - Array of keys to remove
   * @returns {Object} Cleaned object
   */
  static exclude(source, excludedKeys) {
    if (!source) return null;
    const cleaned = { ...source };
    excludedKeys.forEach(key => {
      delete cleaned[key];
    });
    return cleaned;
  }
}

module.exports = BaseDTO;
