const crypto = require('crypto');

/**
 * Generate a 6-digit numeric PIN code
 */
const generatePinCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = generatePinCode;
