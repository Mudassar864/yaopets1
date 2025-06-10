import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, userAPI } from "@/lib/api";

type UserType = {
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
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserType>;
  register: (userData: Partial<UserType>) => Promise<UserType>;
  logout: () => void;
  updateUser: (data: Partial<UserType>) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, load user from token
  useEffect(() => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        authAPI.getCurrentUser()
          .then(response => {
            setUser(response.data);
          })
          .catch(error => {
            console.error("Error loading user:", error);
            localStorage.removeItem('token');
            setUser(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      setIsLoading(false);
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserType> => {
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

  const register = async (userData: Partial<UserType>): Promise<UserType> => {
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

  const updateUser = async (data: Partial<UserType>) => {
    if (!user) return;
    try {
      await userAPI.updateProfile(data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}