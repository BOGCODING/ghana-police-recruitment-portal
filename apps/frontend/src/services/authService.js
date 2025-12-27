/**
 * Unified Auth Service
 * Uses the same api.js utility as AuthContext for consistency.
 * Since HttpOnly cookies are managed by the backend, we don't manipulate them client-side.
 */
import { api } from '../utils/api';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials) => {
    const response = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    // Backend sets HttpOnly cookies automatically
    if (response?.success) {
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    return response;
  },

  /**
   * Register a new user
   */
  register: async (data) => {
    const response = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Backend sets HttpOnly cookies automatically
    if (response?.success) {
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    return response;
  },

  /**
   * Validate a voucher before registration
   */
  validateVoucher: async (serialNumber, pinCode, email, phoneNumber) => {
    const response = await api('/api/auth/validate-voucher', {
      method: 'POST',
      body: JSON.stringify({ serialNumber, pinCode, email, phoneNumber })
    });
    return response;
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state marker (cookies cleared by backend via HttpOnly)
      sessionStorage.removeItem('isLoggedIn');
    }
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    const response = await api('/api/auth/me');
    return response;
  },

  /**
   * Refresh the access token
   */
  refreshToken: async () => {
    try {
      await api('/api/auth/refresh-token', { method: 'POST' });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Request a password reset
   */
  forgotPassword: async (email) => {
    const response = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return response;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, password, confirmPassword) => {
    const response = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword })
    });
    return response;
  }
};

export default authService;
