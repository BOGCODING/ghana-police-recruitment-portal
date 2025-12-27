const { authenticateToken } = require('../auth.middleware');
const { verifyAccessToken } = require('../../config/jwt');
const { query } = require('../../config/database');
const { errorResponse } = require('../../utils/responseHandler');

// Mock dependencies
jest.mock('../../config/jwt', () => ({
  verifyAccessToken: jest.fn()
}));
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));
jest.mock('../../utils/responseHandler', () => ({
  errorResponse: jest.fn()
}));

describe('auth.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    test('should pass with valid Authorization header', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;
      
      verifyAccessToken.mockReturnValue({ id: 1, email: 'test@example.com' });
      query.mockResolvedValue({ 
        rows: [{ id: 1, email: 'test@example.com', serialNumber: 'GPS123' }] 
      });

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        id: 1,
        email: 'test@example.com',
        serialNumber: 'GPS123',
        type: 'applicant'
      });
    });

    test('should pass with valid cookie token', async () => {
      req.cookies.accessToken = 'valid-cookie-token';
      
      verifyAccessToken.mockReturnValue({ id: 2, email: 'user@example.com' });
      query.mockResolvedValue({ 
        rows: [{ id: 2, email: 'user@example.com', serialNumber: 'GPS456' }] 
      });

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.id).toBe(2);
    });

    test('should return 401 if no token provided', async () => {
      await authenticateToken(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Access token required', 401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      verifyAccessToken.mockReturnValue(null);

      await authenticateToken(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Invalid or expired token', 401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if user not found in database', async () => {
      req.headers.authorization = 'Bearer valid-token';
      verifyAccessToken.mockReturnValue({ id: 999, email: 'missing@example.com' });
      query.mockResolvedValue({ rows: [] });

      await authenticateToken(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, 'User not found', 401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 on internal error', async () => {
      req.headers.authorization = 'Bearer token';
      verifyAccessToken.mockImplementation(() => { throw new Error('JWT Error'); });

      await authenticateToken(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Authentication failed', 401);
    });
  });
});
