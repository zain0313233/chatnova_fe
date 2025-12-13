import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage as sendMessageAction, loadHistory as loadHistoryAction } from '@/store/features/chat/chatSlice';
import { ChatResponse } from '../lib/api/chat';

export function useChat() {
  const dispatch = useAppDispatch();
  const { messages, loading, error, currentSessionId } = useAppSelector((state) => state.chat);

  const sendMessage = async (question: string) => {
    // We cast the result to any to avoid strict type checking on the unwrap payload vs return type for now,
    // or we can just return the result of unwrap which is the payload.
    // The component expects the response object.
    const result = await dispatch(sendMessageAction({ question, sessionId: currentSessionId || undefined })).unwrap();
    return result as ChatResponse;
  };

  const loadHistory = async () => {
    await dispatch(loadHistoryAction()).unwrap();
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadHistory,
  };
}
