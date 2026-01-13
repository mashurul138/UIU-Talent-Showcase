import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole, MOCK_USERS, StoredUser } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'uiu_auth_user';
const DB_KEY = 'uiu_auth_users_db';

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

  // Initialize User Database
  useEffect(() => {
    const storedDb = localStorage.getItem(DB_KEY);
    if (!storedDb) {
      // Seed with mock users if empty
      localStorage.setItem(DB_KEY, JSON.stringify(Object.values(MOCK_USERS)));
    } else {
      // Check if we need to migrate (e.g., enable passwords for existing dev users)
      const users = JSON.parse(storedDb);
      const adminUser = users.find((u: any) => u.email === 'admin@uiu.ac.bd');

      // If admin exists but has no password (old mock data), force re-seed
      if (adminUser && !adminUser.password) {
        localStorage.setItem(DB_KEY, JSON.stringify(Object.values(MOCK_USERS)));
        console.log('Database migrated: Passwords enabled');
      }
    }
  }, []);

  // Initialize Session
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const getUsersDb = (): StoredUser[] => {
    const storedDb = localStorage.getItem(DB_KEY);
    return storedDb ? JSON.parse(storedDb) : Object.values(MOCK_USERS);
  };

  const login = (email: string, password: string) => {
    const users = getUsersDb();
    const foundUser = users.find(u => u.email === email);

    // Check if user exists and password matches
    if (!foundUser || foundUser.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Remove password before setting user state
    const { password: _, ...userWithoutPassword } = foundUser;

    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
  };

  const signup = (name: string, email: string, password: string, role: UserRole, studentId?: string) => {
    const users = getUsersDb();

    if (users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role, // Use selected role
      studentId: role === 'creator' ? studentId : undefined, // Only store ID for creators
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Generate random avatar
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));

    // Remove password before setting user state
    const { password: _, ...userWithoutPassword } = newUser;

    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsersDb();
    const socialEmail = `user@${provider}.com`;

    // Check if user exists
    let user = users.find(u => u.email === socialEmail);

    if (!user) {
      // Create new social user
      user = {
        id: `user-${provider}-${Date.now()}`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: socialEmail,
        role: 'creator',
        studentId: `SOCIAL-${provider.toUpperCase()}`,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${socialEmail}`,
      };

      const updatedUsers = [...users, user];
      localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
    }

    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
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
