'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use proxy by default (empty string) to avoid CORS and strictly use next.config.js rewrites
  const rawUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/['"`]/g, '');
  const API_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl.replace(/\/+$/, '');

  // No need for manual cookie reading, API utility handles requests
  const fetchAdmin = useCallback(async () => {
    try {
      // Use api utility - it will automatically send cookies and tokens
      const { data } = await api.get('/admin/me');
      if (data.success) {
        setAdmin(data.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setAdmin(null);
      } else {
        console.error('Admin auth check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const login = async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });

    // Backend sets HttpOnly cookies, but we also store in localStorage for Header fallback
    if (typeof window !== 'undefined' && data.data?.accessToken) {
      localStorage.setItem('adminAccessToken', data.data.accessToken);
      localStorage.setItem('adminRefreshToken', data.data.refreshToken);
    }
    setAdmin(data.data.user);
    return data.data;
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
      }
      setAdmin(null);
      router.push('/login');
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      isAuthenticated: !!admin,
      login,
      logout,
      refetch: fetchAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

// Alias for compatibility if needed
export const useAuth = useAdminAuth;
