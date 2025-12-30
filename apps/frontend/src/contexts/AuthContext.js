import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '../utils/api';

const AuthContext = createContext(null);

// Public routes where auth check is optional (only check if session hint exists)
const PUBLIC_ROUTES = [
  '/',                    // Home page
  '/about',               // About page
  '/contact',             // Contact page
  '/faq',                 // FAQ page
  '/requirements',        // Requirements page
  '/voucher/purchase',    // Voucher purchase
];

// Auth routes where we should NOT check auth (user is definitely not logged in here)
const AUTH_ROUTES = [
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password',
  '/verify-email'
];

/**
 * Check if a pathname matches any route in a list (prefix matching)
 */
const matchesRoute = (pathname, routes) => {
  if (!pathname) return false;
  return routes.some(route => pathname === route || pathname.startsWith(route + '/'));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const fetchAttempted = useRef(false);

  /**
   * Fetches the current user from the backend.
   * Smart logic to avoid unnecessary API calls:
   * - AUTH_ROUTES: Never fetch (user is logging in/registering)
   * - PUBLIC_ROUTES: Only fetch if session hint exists
   * - Protected routes: Always fetch
   */
  const fetchUser = useCallback(async (force = false) => {
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
    const isPublicRoute = matchesRoute(pathname, PUBLIC_ROUTES);
    const hasSessionHint = sessionStorage.getItem('isLoggedIn') === 'true';

    // On auth routes, never fetch - user is logging in or registering
    if (isAuthRoute && !force) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    // On public routes without session hint, skip fetch
    if (isPublicRoute && !hasSessionHint && !force) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    // Prevent duplicate fetches
    if (fetchAttempted.current && !force) {
      return;
    }
    fetchAttempted.current = true;

    try {
      const data = await api('/api/auth/me');
      setUser(data.data);
      setAuthChecked(true);
    } catch (error) {
      // 401 is expected when not logged in - don't log it as an error
      if (error.status !== 401) {
        console.error('Auth check failed:', error);
      }
      setUser(null);
      setAuthChecked(true);
      sessionStorage.removeItem('isLoggedIn');
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  const login = async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Backend sets HttpOnly cookies, but we also store in localStorage for Header fallback
    if (typeof window !== 'undefined' && data.data.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
    sessionStorage.setItem('isLoggedIn', 'true');
    setUser(data.data.user);
    setAuthChecked(true);
    fetchAttempted.current = true;
    return data.data;
  };

  const register = async (formData) => {
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // Backend sets HttpOnly cookies, but we also store in localStorage for Header fallback
      if (typeof window !== 'undefined' && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      sessionStorage.setItem('isLoggedIn', 'true');
      setUser(data.data.user);
      setAuthChecked(true);
      fetchAttempted.current = true;
      return data.data;
    } catch (error) {
      // api utility throws specific error object
      const errorMessage = error.data?.errors && Array.isArray(error.data.errors)
        ? error.data.errors.map(e => e.message).join(', ')
        : (error.message || 'Registration failed');
      throw new Error(errorMessage);
    }
  };

  const validateVoucher = async (serialNumber, pinCode, email, phoneNumber) => {
    const data = await api('/api/auth/validate-voucher', {
      method: 'POST',
      body: JSON.stringify({ serialNumber, pinCode, email, phoneNumber })
    });
    return data.data;
  };

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout errors - we're clearing state anyway
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('isLoggedIn');
      }
      setUser(null);
      setAuthChecked(false);
      fetchAttempted.current = false;
      router.push('/login');
    }
  }, [router]);

  const refreshToken = async () => {
    try {
      await api('/api/auth/refresh-token', { method: 'POST' });
      return true;
    } catch (e) {
      return false;
    }
  };

  // Initial auth check - runs on mount and pathname changes
  useEffect(() => {
    const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
    const isPublicRoute = matchesRoute(pathname, PUBLIC_ROUTES);
    const hasSessionHint = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // On auth routes without session hint, skip fetch entirely
    if (isAuthRoute && !hasSessionHint) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    // On public routes without session hint, skip fetch
    if (isPublicRoute && !hasSessionHint) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    fetchUser();
  }, [fetchUser, pathname]);

  const value = {
    user,
    loading,
    authChecked,
    isAuthenticated: !!user,
    login,
    register,
    validateVoucher,
    logout,
    refreshToken,
    refetch: () => fetchUser(true) // Force refetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
