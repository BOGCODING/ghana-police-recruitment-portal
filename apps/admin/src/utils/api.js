import Cookies from 'js-cookie';

// Get API URL from environment - default to empty for relative paths (proxy)
const rawUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/['"`]/g, '');
export const API_URL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl.replace(/\/+$/, '')) : '';


/**
 * Enhanced fetch wrapper for Admin that automatically adds auth headers
 * and handles token refreshing
 * @param {string} endpoint - API endpoint (e.g., '/api/admin/me')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const api = async (endpoint, options = {}) => {
  // 1. Prepare headers with Access Token
  // Note: Although cookies are HttpOnly and handled by browser, 
  // we might still need Authorization header if backend expects it.
  // Ideally, backend should check BOTH. The current backend middleware checks both.
  // Since HttpOnly cookies cannot be read by JS, we rely on the browser sending them.
  // IF we have a JS-readable cookie (not HttpOnly), we can send it.
  // But for better security, we should rely on credentials: 'include'.
  
  // However, the backend middleware `authenticateAdmin` checks:
  // const authHeader = req.headers.authorization; ... const cookieToken = req.cookies?.adminAccessToken;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If body is FormData, let browser set Content-Type
  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // CRITICAL: Sends cookies with request
  };

  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 2. Perform Request
  let response = await fetch(`${API_URL}${path}`, config);

  // 3. Handle 401 (Unauthorized) - Attempt Refresh
  if (response.status === 401) {
    // Attempt to refresh token
    const refreshSuccessful = await refreshToken();
    
    if (refreshSuccessful) {
      // Retry original request
      response = await fetch(`${API_URL}${path}`, config);
    }
  }

  // 4. Handle Errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `API Error: ${response.statusText}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // 5. Return Data
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return null;
};

/**
 * Helper to refresh admin token
 * @returns {Promise<boolean>} true if successful
 */
async function refreshToken() {
  try {
    // We only need credentials: 'include' because the refresh token is in an HttpOnly cookie
    const response = await fetch(`${API_URL}/api/admin/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default api;
