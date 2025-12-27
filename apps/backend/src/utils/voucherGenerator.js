const { VOUCHER_PREFIX } = require('../config/constants');

/**
 * Generate a secure voucher code
 * Format: GPS-XXXX-XXXX
 */
const generateVoucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${VOUCHER_PREFIX}-${part1}-${part2}`;
};

module.exports = generateVoucherCode;
