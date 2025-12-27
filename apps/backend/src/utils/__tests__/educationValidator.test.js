const {
  isValidWassceGrade,
  isPassingWassceGrade,
  validateWassceForRecruitment,
  validateExaminationYear,
  validateIndexNumber
} = require('../educationValidator');

describe('educationValidator', () => {
  describe('isValidWassceGrade', () => {
    test('should return true for valid grades', () => {
      expect(isValidWassceGrade('A1')).toBe(true);
      expect(isValidWassceGrade('c6')).toBe(true);
      expect(isValidWassceGrade('F9')).toBe(true);
    });

    test('should return false for invalid grades', () => {
      expect(isValidWassceGrade('Z1')).toBe(false);
      expect(isValidWassceGrade('10')).toBe(false);
      expect(isValidWassceGrade('')).toBeFalsy();
    });

    test('should handle null/undefined', () => {
      expect(isValidWassceGrade(null)).toBeFalsy();
      expect(isValidWassceGrade(undefined)).toBeFalsy();
    });
  });

  describe('isPassingWassceGrade', () => {
    test('should return true for C6 and above', () => {
      expect(isPassingWassceGrade('A1')).toBe(true);
      expect(isPassingWassceGrade('B3')).toBe(true);
      expect(isPassingWassceGrade('C6')).toBe(true);
    });

    test('should return false for D7 and below', () => {
      expect(isPassingWassceGrade('D7')).toBe(false);
      expect(isPassingWassceGrade('E8')).toBe(false);
      expect(isPassingWassceGrade('F9')).toBe(false);
    });
  });



  describe('validateWassceForRecruitment', () => {
    test('should fail if core subjects are missing', () => {
      const results = [
        { subject: 'ENGLISH LANGUAGE', grade: 'C6' },
        // Mathematics missing
      ];
      const result = validateWassceForRecruitment(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing core subject: MATHEMATICS (CORE)');
    });

    test('should fail if English or Math is not passing', () => {
      const results = [
        { subject: 'ENGLISH LANGUAGE', grade: 'D7' },
        { subject: 'MATHEMATICS (CORE)', grade: 'C6' },
        { subject: 'INTEGRATED SCIENCE', grade: 'C6' },
        { subject: 'SOCIAL STUDIES', grade: 'C6' },
        { subject: 'E1', grade: 'C6' },
        { subject: 'E2', grade: 'C6' },
      ];
      const result = validateWassceForRecruitment(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('English Language must be C6 or better');
    });

    test('should pass with valid core and elective passes', () => {
      const results = [
        { subject: 'ENGLISH LANGUAGE', grade: 'B3' },
        { subject: 'MATHEMATICS (CORE)', grade: 'C4' },
        { subject: 'INTEGRATED SCIENCE', grade: 'C5' },
        { subject: 'SOCIAL STUDIES', grade: 'C6' },
        { subject: 'E1', grade: 'A1' },
        { subject: 'E2', grade: 'B2' },
      ];
      const result = validateWassceForRecruitment(results);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('validateExaminationYear', () => {
    test('should fail if year is in the future', () => {
      const nextYear = new Date().getFullYear() + 1;
      const result = validateExaminationYear(nextYear);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Year cannot be in the future');
    });

    test('should fail if year is too old', () => {
      const result = validateExaminationYear(1989);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Year must be 1990 or later');
    });

    test('should warn if year is over 10 years old', () => {
      const oldYear = new Date().getFullYear() - 11;
      const result = validateExaminationYear(oldYear);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Results are over 10 years old');
    });
  });

  describe('validateIndexNumber', () => {
    test('should normalize index number', () => {
      const result = validateIndexNumber('012-345 6789');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('0123456789');
    });

    test('should fail if too short', () => {
      const result = validateIndexNumber('123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Index number too short');
    });
  });
});
