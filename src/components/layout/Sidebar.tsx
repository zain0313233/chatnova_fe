'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { chatApi, ChatSession } from '@/lib/api/chat';
import { Plus, MessageSquare } from 'lucide-react';

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Use external collapsed state if provided, otherwise default to false
  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : false;

  // Check if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, don't auto-close
      } else {
        // On mobile, close sidebar when clicking outside
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch sessions if we are on chat page or just generally to show history
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const fetchedSessions = await chatApi.getSessions();
        setSessions(fetchedSessions);
      } catch (err) {
        console.error('Failed to load sessions', err);
      }
    };
    loadSessions();
  }, [pathname]); // Reload when path changes (e.g. new chat created)

  const handleNewChat = () => {
    // Navigate to chat page with no session ID (or handle in ChatInterface)
    // Actually, if we are already on /chat, we might want to trigger a reset.
    // But for now, let's just navigate to /chat which should be the "new chat" state if handled correctly.
    // Or we can force a reload or use a query param.
    router.push('/chat?new=true');
    if (isMobile) onClose();
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`);
    if (isMobile) onClose();
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      name: 'Subscriptions',
      href: '/subscriptions',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      name: 'Plans',
      href: '/plans',
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          isMobile
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
                href="/dashboard"
                className="text-xl font-bold text-purple-600"
                onClick={isMobile ? onClose : undefined}
              >
                AI Chat
              </Link>
            )}
            {isMobile && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {menuItems.map(item => {
              const active = isActive(item.href);
              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={`group flex items-center space-x-3 rounded-lg px-4 py-3 transition ${
                      active
                        ? 'bg-purple-100 font-semibold text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    <span
                      className={active ? 'text-purple-600' : 'text-gray-600'}
                    >
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.name}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Chat Specific Section */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              {(!isCollapsed || isMobile) && (
                <div className="mb-2 px-2">
                  <button
                    onClick={handleNewChat}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white shadow-sm transition hover:bg-purple-700"
                  >
                    <Plus size={18} />
                    <span className="font-medium">New Chat</span>
                  </button>
                </div>
              )}
              
              {(!isCollapsed || isMobile) && (
                 <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                   Recent Chats
                 </h3>
              )}

              <div className="space-y-1">
                {sessions.slice(0, 10).map(session => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className={`flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-left text-sm transition hover:bg-gray-100 ${
                      pathname.includes(session.id) ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    } ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}
                    title={isCollapsed && !isMobile ? session.title || 'Chat' : undefined}
                  >
                    <MessageSquare size={18} className="text-gray-400 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{session.title || 'New Chat'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
