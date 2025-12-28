'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';

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
      // Use api utility - it will automatically send cookies
      // If access token is expired, it will try to refresh automatically
      const data = await api('/api/admin/me');
      setAdmin(data.data);
    } catch (error) {
      if (error.status === 401) {
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
    // api utility wrapper for consistent error handling
    const data = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // We don't need to manually set cookies or localStorage
    // Backend sets HttpOnly cookies
    setAdmin(data.data.user);
    return data.data;
  };

  const logout = async () => {
    try {
      await api('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    }
    setAdmin(null);
    router.push('/login');
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
