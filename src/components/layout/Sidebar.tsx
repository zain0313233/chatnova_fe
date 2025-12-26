'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSessions } from '@/store/features/chat/chatSlice';
import {
  LayoutDashboard,
  Users,
  Box,
  FileText,
  Folder,
  Sparkles,
  MessagesSquare,
  CreditCard,
  TrendingUp,
  User as UserIcon,
  Mic,
  X,
  Plus,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const adminMenuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: <Users size={20} />,
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: <CreditCard size={20} />,
  },
  {
    name: 'Plans',
    href: '/admin/plans',
    icon: <FileText size={20} />,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: <MessagesSquare size={20} />,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: <Settings size={20} />,
  },
];

const userMenuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: <MessagesSquare size={20} />,
  },
  {
    name: 'Subscriptions',
    href: '/subscriptions',
    icon: <CreditCard size={20} />,
  },
  {
    name: 'Plans',
    href: '/plans',
    icon: <FileText size={20} />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({
  isOpen,
  isMobile,
  isCollapsed: externalCollapsed,
  onClose,
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sessions } = useAppSelector((state) => state.chat);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : false;
  const isAdmin = pathname.startsWith('/admin');
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  useEffect(() => {
    if (!isAdmin) {
      dispatch(loadSessions());
    }
  }, [pathname, dispatch, isAdmin]);

  const handleNewChat = () => {
    router.push('/chat?new=true');
    if (isMobile) onClose();
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`);
    if (isMobile) onClose();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${isMobile
          ? isOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full'
          : isCollapsed
            ? 'w-20'
            : 'w-64'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 p-4">
            {(!isCollapsed || isMobile) && (
              <Link
                href={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="text-xl font-bold text-purple-600 focus:outline-none"
                onClick={isMobile ? onClose : undefined}
              >
                ChatNova
              </Link>
            )}
            {isMobile && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-gray-100 focus:outline-none"
                aria-label="Close sidebar"
              >
                <X size={24} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-3 overflow-y-auto p-6 scrollbar-hide mt-5">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={`group flex items-center rounded-full p-2 transition-all duration-200 ${active
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                      } ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    <span className={active ? 'text-white' : 'transition-colors group-hover:text-purple-600'}>
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <span className="text-[15px] font-medium">{item.name}</span>
                    )}
                  </Link>
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}

            {/* User Specific Chat Section */}
            {!isAdmin && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                {(!isCollapsed || isMobile) && (
                  <div className="mb-4">
                    <button
                      onClick={handleNewChat}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-2.5 text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg focus:outline-none active:scale-95"
                    >
                      <Plus size={18} />
                      <span className="font-semibold">New Chat</span>
                    </button>
                  </div>
                )}

                {(!isCollapsed || isMobile) && (
                  <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Recent History
                  </h3>
                )}

                <div className="space-y-1">
                  {sessions.slice(0, 8).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-all hover:bg-purple-50 ${pathname.includes(session.id) ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:text-purple-600'
                        } ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}
                      title={isCollapsed && !isMobile ? session.title || 'Chat' : undefined}
                    >
                      <MessageSquare size={18} className="flex-shrink-0 opacity-70" />
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate font-medium">{session.title || 'Untitled Chat'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
