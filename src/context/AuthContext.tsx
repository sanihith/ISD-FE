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
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('jwt_token'));

  const setToken = useCallback((value: string | null) => {
    if (value) {
      localStorage.setItem('jwt_token', value);
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

  const validateToken = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const userData = res.data;
      setUser(userData);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
      return userData;
    } catch {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem(USER_CACHE_KEY);
      setTokenState(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (token) {
      setIsLoading(true);
      validateToken().finally(() => {
        if (mounted) setIsLoading(false);
      });
    } else {
      setUser(null);
      setIsLoading(false);
    }
    return () => { mounted = false; };
  }, [token, validateToken]);

  const login = useCallback(() => {
    window.location.href = import.meta.env.VITE_AUTH_LOGIN_URL || 'http://localhost:8080/api/auth/login';
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
    window.location.href = import.meta.env.VITE_AUTH_LOGIN_URL || 'http://localhost:8080/api/auth/login';
  }, [setToken]);

  const logout = useCallback(() => {
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
              window.location.href = import.meta.env.VITE_AUTH_LOGIN_URL || 'http://localhost:8080/api/auth/login';
            });
          }
        });
      }
    });
  }, [token]);

  const normalizedRole = (user?.role || '').toUpperCase();
  const isManager = ['MANAGER', 'DIRECTOR', 'ADMIN', 'ROLE_MANAGER', 'ROLE_DIRECTOR', 'ROLE_ADMIN'].includes(normalizedRole);
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, setToken, login, teamsLogin, logout, isAuthenticated, isLoading, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;