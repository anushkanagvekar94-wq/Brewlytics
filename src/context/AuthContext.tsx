import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

export interface User {
  id: number;
  name: string;
  email: string;
  cafeName: string;
  currency: string;
  timezone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirmPass: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('brewlytics_token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const curToken = localStorage.getItem('brewlytics_token');
      if (!curToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.auth.me();
      setUser(data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('brewlytics_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.auth.login({ email, password: pass });
    localStorage.setItem('brewlytics_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, pass: string, confirmPass: string) => {
    const data = await api.auth.register({ name, email, password: pass, confirmPassword: confirmPass });
    localStorage.setItem('brewlytics_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const demoLogin = async () => {
    const data = await api.auth.demoLogin();
    localStorage.setItem('brewlytics_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const idToken = await result.user.getIdToken();
    const data = await api.auth.firebaseLogin(idToken);
    localStorage.setItem('brewlytics_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('brewlytics_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        googleSignIn,
        logout,
        updateUser,
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
