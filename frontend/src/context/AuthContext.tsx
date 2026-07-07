import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../api/tokenStorage';
import type { User, LoginPayload, SignupPayload } from '../types/auth.types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = 'sf_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  
  useEffect(() => {
    const token = getAccessToken();
    const cachedUser = localStorage.getItem(USER_KEY);
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    setIsInitializing(false);
  }, []);

  const persistSession = (sessionUser: User, accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const login = async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    persistSession(result.user, result.accessToken, result.refreshToken);
  };

  const signup = async (payload: SignupPayload) => {
    const result = await authApi.signup(payload);
    persistSession(result.user, result.accessToken, result.refreshToken);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearTokens();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
