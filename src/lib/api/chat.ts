import apiClient from './client';
import { z } from 'zod';

// Validation schemas
export const ChatQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  tokens: z.number(),
  createdAt: z.string(),
});

export const ChatHistoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  question: z.string(),
  answer: z.string(),
  tokens: z.number(),
  createdAt: z.string(),
});

export type ChatQuestion = z.infer<typeof ChatQuestionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatResponse = ChatMessage;
export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;

export const ChatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

export const chatApi = {
  // Send a chat message
  sendMessage: async (question: string, sessionId?: string): Promise<ChatMessage & { sessionId: string }> => {
    const response = await apiClient.post('/api/chat/message', { question, sessionId });
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: {...} }
    const messageData = responseData?.data || responseData;

    // We need to extend the schema validation or just cast it since we added sessionId in backend
    return messageData as ChatMessage & { sessionId: string };
  },

  // Get chat history (legacy)
  getHistory: async (): Promise<ChatHistoryItem[]> => {
    const response = await apiClient.get('/api/chat/history');
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: [...] }
    const historyData = responseData?.data || responseData;

    return z.array(ChatHistoryItemSchema).parse(historyData);
  },

  // Get chat sessions
  getSessions: async (): Promise<ChatSession[]> => {
    const response = await apiClient.get('/api/chat/sessions');
    const responseData = response.data;
    const sessionsData = responseData?.data || responseData;
    return z.array(ChatSessionSchema).parse(sessionsData);
  },

  // Get session messages
  getSessionMessages: async (sessionId: string): Promise<ChatHistoryItem[]> => {
    const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
    const responseData = response.data;
    const messagesData = responseData?.data || responseData;
    return z.array(ChatHistoryItemSchema).parse(messagesData);
  },
};
