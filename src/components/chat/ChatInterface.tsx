'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage, loadSessionMessages, clearMessages, setSessionId, loadSessions, addSession } from '@/store/features/chat/chatSlice';
import { ChatHistoryItem, ChatSession } from '@/types';
import ChatMessage from './ChatMessage';

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionIdParam = searchParams.get('sessionId');
  const isNewChat = searchParams.get('new') === 'true';

  const { messagesBySession, loading, error, currentSessionId, isLoadingHistory, sessions, isSessionsLoaded } = useAppSelector((state) => state.chat);
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages for current session
  const messages = currentSessionId ? (messagesBySession[currentSessionId] || []) : [];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions on mount if not already loaded
  useEffect(() => {
    // Only load if sessions are not yet loaded AND we're not already loading
    if (!isSessionsLoaded && !loading) {
      dispatch(loadSessions());
    }
  }, [dispatch, isSessionsLoaded, loading]);

  // Handle session changes via URL or New Chat
  useEffect(() => {
    if (isNewChat) {
      if (currentSessionId !== null) {
        dispatch(setSessionId(null));
        dispatch(clearMessages(null));
      }
      router.replace('/chat');
      return;
    }

    if (sessionIdParam) {
      if (currentSessionId !== sessionIdParam) {
        const hasMessages = messagesBySession[sessionIdParam]?.length > 0;
        if (!hasMessages && !isLoadingHistory) {
          dispatch(loadSessionMessages(sessionIdParam));
        } else if (hasMessages && currentSessionId !== sessionIdParam) {
          dispatch(setSessionId(sessionIdParam));
        }
      }
    } else if (sessions.length > 0 && !currentSessionId && !isLoadingHistory) {
      // If no sessionId in URL but sessions exist, load the most recent session
      const mostRecentSession = sessions[0];
      const hasMessages = messagesBySession[mostRecentSession.id]?.length > 0;

      if (!hasMessages) {
        dispatch(loadSessionMessages(mostRecentSession.id));
      } else {
        dispatch(setSessionId(mostRecentSession.id));
      }
      router.replace(`/chat?sessionId=${mostRecentSession.id}`, { scroll: false });
    } else if (sessions.length === 0 && currentSessionId !== null && !isLoadingHistory && !loading) {
      dispatch(setSessionId(null));
      dispatch(clearMessages(null));
    }
  }, [sessionIdParam, isNewChat, router, dispatch, currentSessionId, sessions.length, isLoadingHistory, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion('');

    try {
      const result = await dispatch(sendMessage({
        question: userQuestion,
        sessionId: currentSessionId || undefined
      })).unwrap();

      // If new session was created, update URL and add to sessions
      if (!currentSessionId || currentSessionId !== result.sessionId) {
        dispatch(setSessionId(result.sessionId));
        router.replace(`/chat?sessionId=${result.sessionId}`);

        // Create a temporary session object and add it to Redux
        const newSession: ChatSession = {
          id: result.sessionId,
          userId: '',
          title: userQuestion.substring(0, 50) || 'New Chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(addSession(newSession));

        // Also reload sessions to get the complete session data from backend
        dispatch(loadSessions());
      }
    } catch (err: any) {
      console.error('Chat error:', err);
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
              {loading && (
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
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-slate-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm flex items-center"
            >
              {loading ? (
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
