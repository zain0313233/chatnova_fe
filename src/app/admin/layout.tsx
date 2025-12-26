'use client';

import { usePathname } from 'next/navigation';
import { AdminProvider } from '@/lib/auth/adminContext';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import AdminLayoutWrapper from '@/components/layout/AdminLayoutWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/forgot-password';

  return (
    <AdminProvider>
      {isAuthPage ? (
        children
      ) : (
        <ProtectedAdminRoute>
          <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </ProtectedAdminRoute>
      )}
    </AdminProvider>
  );
}

