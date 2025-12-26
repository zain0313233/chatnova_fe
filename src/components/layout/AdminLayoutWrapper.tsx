'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      checkMobile();
    }

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setIsCollapsed(collapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onClose={closeSidebar}
        onCollapse={handleCollapse}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${isMobile ? 'w-full' : isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
      >
        <AdminNavbar onMenuClick={toggleSidebar} isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

