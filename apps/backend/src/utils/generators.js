const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { VOUCHER_PREFIX } = require('../config/constants');

const applicationIdGenerator = require('./applicationIdGenerator');

/**
 * Generate a unique, human-readable Application ID
 * Format: GPS-YYYY-XXXXXX
 */
const generateApplicationId = async () => {
  return await applicationIdGenerator.generate();
};

/**
 * Generate a secure voucher code
 * Format: GPS-YYYY-XXXXXXX
 */
const generateVoucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Safe alphanumeric
  let part1 = '';
  
  for (let i = 0; i < 7; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${VOUCHER_PREFIX}-${new Date().getFullYear()}-${part1}`;
};

/**
 * Generate a serial number for applicants
 * Format: YYYYMMDD-XXXXXXX
 */
const generateSerialNumber = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Safe alphanumeric
  let random = '';
  
  for (let i = 0; i < 7; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${year}${random}`;
};

/**
 * Generate a 6-digit numeric PIN code
 */
const generatePinCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a secure random token (e.g., for password resets)
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateResetToken = () => generateToken(32);

module.exports = {
  generateApplicationId,
  generateVoucherCode,
  generateSerialNumber,
  generatePinCode,
  generateToken,
  generateResetToken,
  generateFileUUID: uuidv4
};
