import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, AuthResponse, LoginCredentials, RegisterData } from '@/lib/api/auth';

interface AuthState {
    user: AuthResponse['user'] | null;
    userType: 'user' | 'admin' | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// Helper to load user from localStorage
const loadUserFromStorage = (): AuthResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('auth_user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load user from storage:', error);
        return null;
    }
};

// Helper to load userType from localStorage
const loadUserTypeFromStorage = (): 'user' | 'admin' | null => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem('user_type') as 'user' | 'admin' | null) || null;
};

const initialState: AuthState = {
    user: loadUserFromStorage(),
    userType: loadUserTypeFromStorage(),
    loading: false,
    error: null,
    isAuthenticated: !!loadUserFromStorage(),
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            if (response.userType) {
                localStorage.setItem('user_type', response.userType);
            }
            return { user: response.user, userType: response.userType || 'user' };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            const response = await authApi.register(data);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            return response.user;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_type');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthResponse['user'] | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            if (action.payload) {
                localStorage.setItem('auth_user', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('auth_user');
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.userType = action.payload.userType;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.userType = null;
                state.isAuthenticated = false;
                state.loading = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user_type');
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                }
            });
    },
});

export const { setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
