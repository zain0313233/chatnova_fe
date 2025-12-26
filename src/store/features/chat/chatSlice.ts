import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi, ChatResponse, ChatHistoryItem, ChatSession } from '@/lib/api/chat';
import { handleApiError } from '@/lib/utils/errors';

interface ChatState {
    messagesBySession: Record<string, (ChatResponse | ChatHistoryItem)[]>;
    sessions: ChatSession[];
    loading: boolean;
    error: string | null;
    currentSessionId: string | null;
    isLoadingHistory: boolean;
    isSessionsLoaded: boolean;
}

const initialState: ChatState = {
    messagesBySession: {},
    sessions: [],
    loading: false,
    error: null,
    currentSessionId: null,
    isLoadingHistory: false,
    isSessionsLoaded: false,
};

export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ question, sessionId }: { question: string; sessionId?: string }, { rejectWithValue }) => {
        try {
            const response = await chatApi.sendMessage(question, sessionId);
            return response;
        } catch (err: any) {
            return rejectWithValue(handleApiError(err));
        }
    }
);

export const loadHistory = createAsyncThunk(
    'chat/loadHistory',
    async (_, { rejectWithValue }) => {
        try {
            const history = await chatApi.getHistory();
            return history;
        } catch (err: any) {
            return rejectWithValue(handleApiError(err));
        }
    }
);

export const loadSessions = createAsyncThunk(
    'chat/loadSessions',
    async (_, { rejectWithValue }) => {
        try {
            const sessions = await chatApi.getSessions();
            return sessions;
        } catch (err: any) {
            return rejectWithValue(handleApiError(err));
        }
    }
);

export const loadSessionMessages = createAsyncThunk(
    'chat/loadSessionMessages',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const messages = await chatApi.getSessionMessages(sessionId);
            return { sessionId, messages };
        } catch (err: any) {
            return rejectWithValue(handleApiError(err));
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        clearMessages: (state, action: PayloadAction<string | null>) => {
            // Clear messages for a specific session, or all if null
            if (action.payload === null) {
                state.messagesBySession = {};
            } else {
                delete state.messagesBySession[action.payload];
            }
        },
        setSessionId: (state, action: PayloadAction<string | null>) => {
            state.currentSessionId = action.payload;
        },
        addSession: (state, action: PayloadAction<ChatSession>) => {
            // Add session if it doesn't already exist
            const sessionExists = state.sessions.some(session => session.id === action.payload.id);
            if (!sessionExists) {
                // Add to the beginning of the array (most recent first)
                state.sessions = [action.payload, ...state.sessions];
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Send Message
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.sessionId) {
                    state.currentSessionId = action.payload.sessionId;
                    const sessionId = action.payload.sessionId;

                    // Initialize session messages array if it doesn't exist
                    if (!state.messagesBySession[sessionId]) {
                        state.messagesBySession[sessionId] = [];
                    }

                    // Check if message already exists to avoid duplicates
                    const messageExists = state.messagesBySession[sessionId].some(msg => msg.id === action.payload.id);
                    if (!messageExists) {
                        // Append message to maintain chronological order
                        state.messagesBySession[sessionId] = [...state.messagesBySession[sessionId], action.payload];
                    }
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Load History
            .addCase(loadHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadHistory.fulfilled, (state, action) => {
                state.loading = false;
                // Legacy: loadHistory loads all messages, we'll group them by session
                // For now, if we have a current session, store them there
                if (state.currentSessionId) {
                    state.messagesBySession[state.currentSessionId] = action.payload;
                }
            })
            .addCase(loadHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Load Sessions
            .addCase(loadSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
                state.isSessionsLoaded = true;
            })
            .addCase(loadSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isSessionsLoaded = true;
            })
            // Load Session Messages
            .addCase(loadSessionMessages.pending, (state) => {
                state.isLoadingHistory = true;
                state.error = null;
            })
            .addCase(loadSessionMessages.fulfilled, (state, action) => {
                state.isLoadingHistory = false;
                // Store messages for this specific session without overriding other sessions
                state.messagesBySession[action.payload.sessionId] = action.payload.messages;
                state.currentSessionId = action.payload.sessionId;
            })
            .addCase(loadSessionMessages.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearMessages, setSessionId, addSession } = chatSlice.actions;
export default chatSlice.reducer;
