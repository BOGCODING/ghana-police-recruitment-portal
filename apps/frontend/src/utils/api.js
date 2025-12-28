// Get API URL from environment
const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim().replace(/['"`]/g, '');
export const API_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl.replace(/\/+$/, '');

// Track if a refresh is already in progress to prevent duplicate attempts
let isRefreshing = false;
let refreshPromise = null;

// Endpoints that should NOT trigger a token refresh on 401
const NO_REFRESH_ENDPOINTS = [
  '/api/auth/refresh-token',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/validate-voucher',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

/**
 * Enhanced fetch wrapper that automatically handles cookies
 * and token refreshing with smart retry logic
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/me')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const api = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header from localStorage as a fallback for cross-site cookie blocks
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // If body is FormData, let the browser set Content-Type with boundary
  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // CRITICAL: Sends cookies with request
  };

  // Ensure endpoint starts with / if not present
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let response = await fetch(`${API_URL}${path}`, config);
  
  // Handle 401 (Unauthorized) - Attempt Refresh only for appropriate endpoints
  if (response.status === 401 && !shouldSkipRefresh(path)) {
    console.warn(`[API] 401 Unauthorized for ${path}. Attempting token refresh...`);
    const refreshSuccessful = await attemptTokenRefresh();
    
    if (refreshSuccessful) {
      console.log(`[API] Token refresh successful. Retrying ${path}...`);
      // Retry original request after successful refresh
      response = await fetch(`${API_URL}${path}`, config);
      if (response.ok) {
        console.log(`[API] Retry successful for ${path}`);
      } else {
        console.error(`[API] Retry failed for ${path} with status ${response.status}`);
      }
    } else {
      console.error(`[API] Token refresh failed. Cannot retry ${path}`);
    }
  }

  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Ensure message is a string for the Error constructor
    let message = errorData.message || `API Error: ${response.statusText}`;
    if (typeof message !== 'string') {
      message = message.message || JSON.stringify(message);
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Handle different response types
  if (options.responseType === 'blob') {
    return response.blob();
  }
  
  if (options.responseType === 'text') {
    return response.text();
  }

  // Default: Return json content if exists, otherwise null
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
};

/**
 * Check if an endpoint should skip the refresh token logic
 */
function shouldSkipRefresh(path) {
  return NO_REFRESH_ENDPOINTS.some(ep => path.includes(ep));
}

/**
 * Attempt to refresh the access token with deduplication
 * Only one refresh can be in progress at a time
 * @returns {Promise<boolean>} true if successful
 */
async function attemptTokenRefresh() {
  // If a refresh is already in progress, wait for it
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.success && data.data?.accessToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.data.accessToken);
            // If the backend also returns a new refresh token, update it
            if (data.data.refreshToken) {
              localStorage.setItem('refreshToken', data.data.refreshToken);
            }
          }
        }
        return true;
      }
    } catch (error) {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export default api;
