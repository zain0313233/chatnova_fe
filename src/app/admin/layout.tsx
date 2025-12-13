'use client';

import { AdminProvider } from '@/lib/auth/adminContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}

