const { hashPassword, comparePassword, validatePasswordStrength } = require('../passwordHasher');

describe('passwordHasher', () => {
  describe('hashPassword & comparePassword', () => {
    test('should hash and verify a password successfully', async () => {
      const password = 'StrongPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const password = 'CorrectPass123!';
      const wrongPassword = 'WrongPass123!';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should pass for strong password', () => {
      const result = validatePasswordStrength('SecureP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail for short password', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    test('should fail if missing uppercase', () => {
      const result = validatePasswordStrength('securep@ss123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should fail if missing number', () => {
      const result = validatePasswordStrength('SecureP@ss');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should fail if missing special character', () => {
      const result = validatePasswordStrength('SecurePass123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
