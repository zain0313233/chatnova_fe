'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi, AdminAuthResponse } from '../api/admin';

interface AdminContextType {
  admin: AdminAuthResponse['admin'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'admin_user';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminAuthResponse['admin'] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load admin from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      const token = localStorage.getItem('admin_token');
      
      if (stored && token) {
        try {
          setAdmin(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to load admin from storage:', error);
          localStorage.removeItem(ADMIN_STORAGE_KEY);
          localStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const response = await adminApi.login(email, password);
    setAdmin(response.admin);
  };

  const handleLogout = () => {
    setAdmin(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem('admin_token');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

