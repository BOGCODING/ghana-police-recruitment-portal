const crypto = require('crypto');

/**
 * Generate a secure random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = { 
  generateToken, 
  generateResetToken: () => generateToken(32) 
};
