import axios from 'axios';
import jsCookie from 'js-cookie';

export const rawUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/['"`]/g, '');
export const baseURL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`) : '/api';
export const API_URL = rawUrl ? rawUrl.replace(/\/+$/, '') : ''; // Base URL without /api prefix

const api = axios.create({
  baseURL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('adminRefreshToken') : null;
      
      // Silence 401 for /admin/me - it's expected for logged out admins
      if (originalRequest.url.includes('/admin/me')) {
        if (!refreshToken) {
          return Promise.resolve({ data: { success: false, data: null } });
        }
      }

      // Only attempt refresh if we have a refresh token
      if (refreshToken) {
        originalRequest._retry = true;
        
        try {
          const { data } = await axios.post(`${baseURL}/admin/refresh-token`, 
            { refreshToken },
            { 
              withCredentials: true,
              timeout: 10000 // 10 seconds for refresh specifically
            }
          );

          if (data.success && data.data.accessToken) {
            localStorage.setItem('adminAccessToken', data.data.accessToken);
            if (data.data.refreshToken) {
              localStorage.setItem('adminRefreshToken', data.data.refreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, just clean up and redirect if we're not already heading to login
        localStorage.removeItem('adminAccessToken');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
