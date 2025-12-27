const { toCamelCase, toSnakeCase } = require('../transformers');

describe('transformers', () => {
  describe('toCamelCase', () => {
    test('should transform snake_case keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        user_id: 123
      };
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        userId: 123
      };
      expect(toCamelCase(input)).toEqual(expected);
    });

    test('should handle nested objects', () => {
      const input = {
        user_info: {
          born_at: 'Accra',
          phone_number: '0244'
        }
      };
      const expected = {
        userInfo: {
          bornAt: 'Accra',
          phoneNumber: '0244'
        }
      };
      expect(toCamelCase(input)).toEqual(expected);
    });

    test('should handle arrays of objects', () => {
      const input = [
        { item_id: 1 },
        { item_id: 2 }
      ];
      const expected = [
        { itemId: 1 },
        { itemId: 2 }
      ];
      expect(toCamelCase(input)).toEqual(expected);
    });

    test('should serialize Date objects to ISO string', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(toCamelCase(date)).toBe(date.toISOString());
    });

    test('should handle null and undefined', () => {
      expect(toCamelCase(null)).toBeNull();
      expect(toCamelCase(undefined)).toBeUndefined();
    });

    test('should handle primitives', () => {
      expect(toCamelCase('hello')).toBe('hello');
      expect(toCamelCase(123)).toBe(123);
    });
  });

  describe('toSnakeCase', () => {
    test('should transform camelCase keys to snake_case', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        userId: 123
      };
      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        user_id: 123
      };
      expect(toSnakeCase(input)).toEqual(expected);
    });

    test('should handle nested objects', () => {
      const input = {
        userInfo: {
          bornAt: 'Accra',
          phoneNumber: '0244'
        }
      };
      const expected = {
        user_info: {
          born_at: 'Accra',
          phone_number: '0244'
        }
      };
      expect(toSnakeCase(input)).toEqual(expected);
    });

    test('should handle arrays', () => {
      const input = [{ userId: 1 }];
      const expected = [{ user_id: 1 }];
      expect(toSnakeCase(input)).toEqual(expected);
    });
  });
});
