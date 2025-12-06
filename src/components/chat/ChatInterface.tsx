'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { ChatHistoryItem } from '@/types';
import ChatMessage from './ChatMessage';

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdParam = searchParams.get('sessionId');
  const isNewChat = searchParams.get('new') === 'true';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionIdParam);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle session changes via URL or New Chat
  useEffect(() => {
    const loadSession = async () => {
      if (isNewChat) {
        setCurrentSessionId(null);
        setMessages([]);
        // Clean up URL
        router.replace('/chat');
        return;
      }

      if (sessionIdParam) {
        try {
          setIsLoadingHistory(true);
          setCurrentSessionId(sessionIdParam);
          const msgs = await chatApi.getSessionMessages(sessionIdParam);
          setMessages(msgs);
        } catch (err) {
          console.error('Failed to load session messages:', err);
          setError('Failed to load chat history');
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // No session ID, maybe load most recent or just show empty state?
        // For now, let's just show empty state (New Chat)
        setCurrentSessionId(null);
        setMessages([]);
      }
    };

    loadSession();
  }, [sessionIdParam, isNewChat, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setError(null);
    setIsLoading(true);

    // Optimistic UI
    const tempId = Date.now().toString();
    const optimisticMessage: ChatHistoryItem = {
      id: tempId,
      userId: '',
      question: userQuestion,
      answer: '',
      tokens: 0,
      createdAt: new Date().toISOString(),
    };
    
    // Show optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await chatApi.sendMessage(userQuestion, currentSessionId || undefined);

      // If new session was created, update URL without reloading
      if (!currentSessionId || currentSessionId !== response.sessionId) {
        setCurrentSessionId(response.sessionId);
        router.replace(`/chat?sessionId=${response.sessionId}`);
      }

      // Replace optimistic message with real one (or just append if we didn't add optimistic)
      // Since we added optimistic message, we should ideally replace it.
      // But for simplicity, let's just update the last message or re-fetch.
      // Actually, let's just append the real response and filter out the optimistic one if needed.
      // Better yet, let's just update the messages list with the real response.
      
      const realMessage: ChatHistoryItem = {
        id: response.id,
        userId: '',
        question: userQuestion,
        answer: response.answer,
        tokens: response.tokens,
        createdAt: response.createdAt,
      };

      setMessages(prev => prev.map(msg => msg.id === tempId ? realMessage : msg));

    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to send message. Please try again.';

      setError(errorMessage);
      console.error('Chat error:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    className="h-10 w-10 text-purple-600"
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
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">
                  How can I help you today?
                </h3>
                <p className="text-slate-600 mb-8">
                  I can help you write code, answer questions, or just chat. Start a conversation below!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <button onClick={() => setQuestion("What is Node.js?")} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition text-sm text-slate-700">
                    "What is Node.js?"
                  </button>
                  <button onClick={() => setQuestion("Explain React hooks")} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition text-sm text-slate-700">
                    "Explain React hooks"
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-full max-w-3xl">
                    <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-slate-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm flex items-center"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
