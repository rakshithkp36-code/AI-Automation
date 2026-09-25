import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Manager' | 'Employee' | 'Automation Operator';
  organization_id: string;
  organization_name?: string;
  department?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'Admin' | 'Manager' | 'Employee' | 'Automation Operator') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flowpilot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('flowpilot_token');
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('[Auth] Stored session invalid, clearing token.');
          localStorage.removeItem('flowpilot_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('flowpilot_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('flowpilot_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('flowpilot_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: 'Admin' | 'Manager' | 'Employee' | 'Automation Operator') => {
    const emails: Record<string, string> = {
      Admin: 'admin@flowpilot.ai',
      Manager: 'sarah.manager@flowpilot.ai',
      Employee: 'alex.employee@flowpilot.ai',
      'Automation Operator': 'marcus.ops@flowpilot.ai',
    };
    const email = emails[role] || 'admin@flowpilot.ai';
    await login(email, 'password123');
  };

  const refreshUser = async () => {
    if (localStorage.getItem('flowpilot_token')) {
      const profile = await api.getMe();
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
