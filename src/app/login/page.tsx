'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import AuthLeftCard from '@/components/auth/AuthLeftCard';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, userType } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect if authenticated AND token exists in localStorage
    // This prevents redirect loops when token is cleared but Redux state hasn't updated yet
    if (!loading && isAuthenticated && !hasRedirected.current) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        hasRedirected.current = true;
        // Redirect based on user type
        const currentUserType = userType || localStorage.getItem('user_type') || 'user';
        if (currentUserType === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, loading, router, userType]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <AuthLeftCard />
      <LoginForm />
    </div>
  );
}
