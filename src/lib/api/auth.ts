import apiClient, { apiClient as apiClientInstance } from './client';
import { z } from 'zod';

// Validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional().nullable(),
  }),
  userType: z.enum(['user', 'admin']).optional(),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserType = 'user' | 'admin';

export const authApi = {
  // Register a new user
  register: async (data: Register): Promise<AuthResponse> => {
    // Only send email and password to match backend API
    const payload = {
      email: data.email,
      password: data.password,
    };
    const response = await apiClient.post('/api/auth/signup', payload);

    // Backend response structure: { message: string, data: { user: {...}, token: string } }
    const responseData = response.data;

    // Extract token and user from data object
    const token = responseData?.data?.token || responseData?.token;
    const user = responseData?.data?.user || responseData?.user;

    if (!token || !user) {
      throw new Error('Invalid response format: missing token or user data');
    }

    const authData: AuthResponse = {
      token: String(token),
      user: {
        id: String(user.id || user._id || ''),
        email: String(user.email || ''),
        name: user.name ? String(user.name) : undefined,
      },
    };

    // Store token
    apiClientInstance.setToken(authData.token);

    return authData;
  },

  // Login user or admin (unified)
  login: async (data: Login): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/signin', data);

    // Backend response structure: { message: string, data: { user: {...}, token: string, userType: 'user'|'admin' } }
    const responseData = response.data;

    // Extract token, user, and userType from data object
    const token = responseData?.data?.token || responseData?.token;
    const user = responseData?.data?.user || responseData?.user;
    const userType = responseData?.data?.userType || responseData?.userType || 'user';

    if (!token || !user) {
      throw new Error('Invalid response format: missing token or user data');
    }

    const authData: AuthResponse = {
      token: String(token),
      user: {
        id: String(user.id || user._id || ''),
        email: String(user.email || ''),
        name: user.name ? String(user.name) : undefined,
      },
      userType: userType as UserType,
    };

    // Store token and userType
    apiClientInstance.setToken(authData.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_type', userType);
      // If admin, also store in admin_token for compatibility
      if (userType === 'admin') {
        localStorage.setItem('admin_token', authData.token);
        localStorage.setItem('admin_user', JSON.stringify(authData.user));
      }
    }

    return authData;
  },

  // Logout user or admin
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('auth_user');
    }
  },

  // Get current user (if token is valid)
  getCurrentUser: async (): Promise<AuthResponse['user'] | null> => {
    try {
      const response = await apiClient.get('/api/auth/me');
      const responseData = response.data;

      // Handle different response structures
      const user =
        responseData?.data?.user || responseData?.user || responseData;

      if (user && user.id && user.email) {
        return {
          id: String(user.id),
          email: String(user.email),
          name: user.name ? String(user.name) : undefined,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },
};
