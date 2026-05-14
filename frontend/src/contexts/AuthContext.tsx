import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { getAvatarUrl } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  birth_date?: string;
  gender?: string;
  avatar?: string;
  rating: number;
  level: number;
  league: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const initAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const response = await api.get('/profile');
        const data = response.data;
        setUser({ ...data, avatar: getAvatarUrl(data.avatar) });
      } catch (error) {
        setToken(null);
        setUser(null);
      }
    } else {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post('/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token: newRefresh } = res.data;
          localStorage.setItem('token', access_token);
          if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          setToken(access_token);
          const response = await api.get('/profile');
          const data = response.data;
          setUser({ ...data, avatar: getAvatarUrl(data.avatar) });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          setToken(null);
          setUser(null);
        }
      }
    }
    setIsLoading(false);
  };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setToken(access_token);

      const profileResponse = await api.get('/profile');
      const data = profileResponse.data;
      setUser({ ...data, avatar: getAvatarUrl(data.avatar) });

      toast.success('Welcome back!');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const loginWithToken = async (accessToken: string) => {
    localStorage.setItem('token', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken);
    const profileResponse = await api.get('/profile');
    const data = profileResponse.data;
    setUser({ ...data, avatar: getAvatarUrl(data.avatar) });
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await api.post('/register', { username, email, password });
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // cookie с refresh_token браузер отправит сам — бэк его отзовёт
      await api.post('/logout', { refresh_token: localStorage.getItem('refresh_token') });
    } catch {
      // ignore backend errors — always clean up locally
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };


  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

