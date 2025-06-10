import { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  profileImage?: string;
  city?: string;
  bio?: string;
  website?: string;
  userType?: string;
  points?: number;
  level?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}