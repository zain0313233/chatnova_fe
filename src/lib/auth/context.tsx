'use client';

import React, { createContext, useContext } from 'react';
import { AuthResponse } from '../api/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login as loginAction, register, logout } from '@/store/features/auth/authSlice';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  userType: 'user' | 'admin' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, userType, loading } = useAppSelector((state) => state.auth);

  // Load user from local storage on mount (handled by initial state in slice, but we might want verification later)
  // For now, the slice initial state handles loading from localStorage.

  const handleLogin = async (email: string, password: string) => {
    await dispatch(loginAction({ email, password })).unwrap();
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    await dispatch(register({ email, password, name })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
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
