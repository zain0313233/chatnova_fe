'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/auth/adminContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, loading } = useAdmin();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Check both Redux state and token existence to prevent redirect loops
    if (!loading && !hasRedirected.current) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      // If not authenticated OR token is missing, redirect to admin login
      if (!isAuthenticated || !token) {
        hasRedirected.current = true;
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, loading, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

