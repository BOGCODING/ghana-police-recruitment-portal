const applicationIdGenerator = require('../applicationIdGenerator');
const { query } = require('../../config/database');

// Mock database query
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

describe('applicationIdGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    test('should generate a valid application ID', async () => {
      query.mockResolvedValueOnce({ rows: [] });
      
      const appId = await applicationIdGenerator.generate();
      const currentYear = new Date().getFullYear();
      
      expect(appId).toMatch(new RegExp(`^GPS-${currentYear}-[A-Z2-9]{10}$`));
      expect(query).toHaveBeenCalled();
    });

    test('should retry if collision occurs', async () => {
      // First attempt: collision found
      query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });
      // Second attempt: unique
      query.mockResolvedValueOnce({ rows: [] });
      
      const appId = await applicationIdGenerator.generate();
      
      expect(appId).toBeDefined();
      expect(query).toHaveBeenCalledTimes(2);
    });
  });

  describe('parse', () => {
    test('should parse valid ID correctly', () => {
      const id = 'GPS-2025-ABC456DEF7';
      const parsed = applicationIdGenerator.parse(id);
      
      expect(parsed).toEqual({
        prefix: 'GPS',
        year: 2025,
        suffix: 'ABC456DEF7'
      });
    });

    test('should return null for invalid format', () => {
      expect(applicationIdGenerator.parse('GPS-2025-123')).toBeNull();
      expect(applicationIdGenerator.parse('INVALID-ID')).toBeNull();
      expect(applicationIdGenerator.parse('GPS-25-ABCDEFGHIJ')).toBeNull();
    });
  });
});
