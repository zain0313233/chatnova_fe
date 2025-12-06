'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ChatInterface from '@/components/chat/ChatInterface';

function ChatPageContent() {
  return (
    <LayoutWrapper>
      <div className="h-full w-full">
        <ChatInterface />
      </div>
    </LayoutWrapper>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
