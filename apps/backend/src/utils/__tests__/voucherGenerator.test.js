const generateVoucherCode = require('../voucherGenerator');
const { VOUCHER_PREFIX } = require('../../config/constants');

describe('voucherGenerator', () => {
  test('should generate a voucher in the correct format', () => {
    const code = generateVoucherCode();
    const regex = new RegExp(`^${VOUCHER_PREFIX}-[A-Z2-9]{4}-[A-Z2-9]{4}$`);
    
    expect(code).toMatch(regex);
  });

  test('should generate unique codes (statistically)', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateVoucherCode());
    }
    expect(codes.size).toBe(100);
  });
});
