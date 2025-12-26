'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full w-full">
      <ChatInterface />
    </div>
  );
}
