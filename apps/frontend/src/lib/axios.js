import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Verify we are not already hitting the refresh endpoint to avoid loops
        if (originalRequest.url.includes('/auth/refresh-token')) {
            throw new Error('Refresh token expired');
        }

        const res = await axios.post(`${API_URL}/api/auth/refresh-token`, 
          { refreshToken },
          { withCredentials: true }
        );

        if (res.data && res.data.success) {
          const { accessToken } = res.data.data;
          Cookies.set('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth state and redirect
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        sessionStorage.removeItem('isLoggedIn');
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
