const { formatPhone } = require('../phoneFormatter');

describe('phoneFormatter', () => {
  test('should format 0... number to 233...', () => {
    expect(formatPhone('0244123456')).toBe('233244123456');
    expect(formatPhone('0507894561')).toBe('233507894561');
  });

  test('should keep 233... numbers as is', () => {
    expect(formatPhone('233244123456')).toBe('233244123456');
  });

  test('should add 233 to numbers without prefix', () => {
    expect(formatPhone('244123456')).toBe('233244123456');
  });

  test('should strip non-numeric characters', () => {
    expect(formatPhone('+233 24-412 3456')).toBe('233244123456');
    expect(formatPhone('024-412 3456')).toBe('233244123456');
  });

  test('should handle empty input (strip all non-digits)', () => {
    expect(formatPhone('')).toBe('233');
    expect(formatPhone('abc')).toBe('233');
  });
});
