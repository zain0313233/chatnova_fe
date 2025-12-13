import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi, ChatResponse, ChatHistoryItem } from '@/lib/api/chat';
import { handleApiError } from '@/lib/utils/errors';

interface ChatState {
    messages: (ChatResponse | ChatHistoryItem)[];
    loading: boolean;
    error: string | null;
    currentSessionId: string | null;
}

const initialState: ChatState = {
    messages: [],
    loading: false,
    error: null,
    currentSessionId: null,
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

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
        },
        setSessionId: (state, action: PayloadAction<string | null>) => {
            state.currentSessionId = action.payload;
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
                // Check if message already exists (optimistic update handling if needed later)
                // For now, typically we prepend or append. Existing hook prepended.
                state.messages = [action.payload, ...state.messages];
                if (action.payload.sessionId) {
                    state.currentSessionId = action.payload.sessionId;
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
                state.messages = action.payload;
            })
            .addCase(loadHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearMessages, setSessionId } = chatSlice.actions;
export default chatSlice.reducer;
