import { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<any>(null);
  // Start loading if there's a token to validate; otherwise we know auth state immediately
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('jwt_token'));

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem('jwt_token', value);
    } else {
      localStorage.removeItem('jwt_token');
    }
    setTokenState(value);
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      apiClient.get('/auth/me')
        .then(res => {
          setUser(res.data);
          setIsLoading(false);
        })
        .catch(() => {
          // Token is invalid/expired — clear it and redirect to login
          localStorage.removeItem('jwt_token');
          setTokenState(null);
          setUser(null);
          setIsLoading(false);
        });
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = () => {
    window.location.href = import.meta.env.VITE_AUTH_LOGIN_URL || 'http://localhost:8080/api/auth/login';
  };

  const teamsLogin = async () => {
    // If in Teams, use Teams SSO
    const inTeams = await initTeams();
    if (inTeams) {
      try {
        const user = await getTeamsUser();
        if (user?.email) {
          // Get JWT from backend using Teams identity
          const res = await apiClient.post('/auth/teams-token', {
            email: user.email,
            displayName: user.displayName,
          });
          const { token } = res.data;
          setToken(token);
          window.location.href = '/dashboard';
          return;
        }
      } catch (e) {
        // Fall through to redirect login
      }
    }
    // Fallback: redirect to backend OAuth2
    window.location.href = import.meta.env.VITE_AUTH_LOGIN_URL || 'http://localhost:8080/api/auth/login';
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    queryClient.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    // Also init teams on mount for silent SSO
    initTeams().then(inTeams => {
      if (inTeams) {
        getTeamsUser().then(user => {
          if (user?.email && token) {
            apiClient.get('/auth/me').catch(() => {
              // Re-authenticate
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

  // Only consider authenticated if we have BOTH a token AND a validated user
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, setToken, login, teamsLogin, logout, isAuthenticated, isLoading, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;