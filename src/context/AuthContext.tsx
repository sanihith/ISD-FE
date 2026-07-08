import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { initTeams, getTeamsUser } from '../utils/teamsAuth';

interface AuthContextType {
  user: any;
  token: string | null;
  setToken: (value: string | null) => void;
  login: () => void;
  teamsLogin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isManager: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_CACHE_KEY = 'worktrack_user_cache';
const USER_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Always start loading to check cookie-based session

  const setToken = useCallback((value: string | null) => {
    if (value) {
      localStorage.setItem('jwt_token', value);
      setIsLoading(true);
    } else {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem(USER_CACHE_KEY);
    }
    setTokenState(value);
  }, []);

  // Load cached user immediately to avoid flash
  useEffect(() => {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      try {
        const { user: cachedUser, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < USER_CACHE_TTL) {
          setUser(cachedUser);
        }
      } catch {
        // Ignore cache parse errors
      }
    }
  }, []);

  const validateToken = useCallback(async (tokenToValidate: string | null, signal?: AbortSignal) => {
    try {
      const res = await apiClient.get('/auth/me', { signal });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
      return userData;
    } catch (error: any) {
      if (error?.name === 'CanceledError') {
        return null;
      }
      const currentStorageToken = localStorage.getItem('jwt_token');
      if (currentStorageToken === tokenToValidate || (!tokenToValidate && !currentStorageToken)) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem(USER_CACHE_KEY);
        setTokenState(null);
        setUser(null);
      }
      return null;
    }
  }, []);

  // Validate token on mount and when token changes
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setIsLoading(true);
    validateToken(token, controller.signal).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { 
      mounted = false;
      controller.abort();
    };
  }, [validateToken, token]);

  const getLoginUrl = () => {
    if (import.meta.env.VITE_AUTH_LOGIN_URL) return import.meta.env.VITE_AUTH_LOGIN_URL;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return `${baseUrl}/auth/login`;
  };

  const login = useCallback(() => {
    window.location.href = getLoginUrl();
  }, []);

  const teamsLogin = useCallback(async () => {
    const inTeams = await initTeams();
    if (inTeams) {
      try {
        const user = await getTeamsUser();
        if (user?.email) {
          const res = await apiClient.post('/auth/teams-token', {
            email: user.email,
            displayName: user.displayName,
          });
          const { token: newToken } = res.data;
          setToken(newToken);
          window.location.href = '/dashboard';
          return;
        }
      } catch (e) {
        // Fall through to redirect login
      }
    }
    window.location.href = getLoginUrl();
  }, [setToken]);

  const logout = useCallback(async () => {
    // Call backend to clear HTTP-only cookie
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }
    setToken(null);
    setUser(null);
    queryClient.clear();
    window.location.href = '/login';
  }, [setToken, queryClient]);

  useEffect(() => {
    initTeams().then(inTeams => {
      if (inTeams) {
        getTeamsUser().then(user => {
          if (user?.email && token) {
            apiClient.get('/auth/me').catch(() => {
              window.location.href = getLoginUrl();
            });
          }
        });
      }
    });
  }, [token]);

  const normalizedRole = (user?.role || '').toUpperCase();
  const isManager = ['MANAGER', 'DIRECTOR', 'ADMIN', 'ROLE_MANAGER', 'ROLE_DIRECTOR', 'ROLE_ADMIN'].includes(normalizedRole);
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';

  const isAuthenticated = !!user; // Authenticated if user exists (via token or cookie)

  return (
    <AuthContext.Provider value={{ user, token, setToken, login, teamsLogin, logout, isAuthenticated, isLoading, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;