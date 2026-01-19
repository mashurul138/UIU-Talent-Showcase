import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole, normalizeRole } from '../types/auth';
import { api } from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'uiu_auth_user';
const TOKEN_KEY = 'uiu_auth_token';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize Session
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const normalizedUser = { ...parsedUser, role: normalizeRole(parsedUser?.role) };
        setUser(normalizedUser);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password);
      const { user, token } = data;
      const normalizedUser = { ...user, role: normalizeRole(user?.role) };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string, studentId?: string) => { // Role type mismatch fix potentially needed
    try {
      const data = await api.auth.register(name, email, password, role);
      const { user, token } = data;
      const normalizedUser = { ...user, role: normalizeRole(user?.role) };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      throw error;
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    // Placeholder for social login - usually requires backend support too
    console.log("Social login not yet implemented with backend", provider);
    alert("Social login is currently a placeholder.");
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    signup,
    socialLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

