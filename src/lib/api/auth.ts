import apiClient, { apiClient as apiClientInstance } from './client';
import { z } from 'zod';

// Strong password validation
const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: strongPasswordSchema,
  name: z.string().optional(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordSchema,
});

export const VerifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
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
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserType = 'user' | 'admin';

export const authApi = {
  // Register a new user (now returns message, user needs to verify email)
  register: async (data: Register): Promise<{ message: string; user: { id: string; email: string } }> => {
    // Only send email and password to match backend API
    const payload = {
      email: data.email,
      password: data.password,
    };
    const response = await apiClient.post('/api/auth/signup', payload);

    // Backend response structure: { message: string, data: { user: {...} } }
    const responseData = response.data;
    const user = responseData?.data?.user || responseData?.user;

    if (!user) {
      throw new Error('Invalid response format: missing user data');
    }

    return {
      message: responseData?.message || 'Account created successfully',
      user: {
        id: String(user.id || user._id || ''),
        email: String(user.email || ''),
      },
    };
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

  // Google OAuth sign in
  signInWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/google', { idToken });

    // Backend response structure: { message: string, data: { user: {...}, token: string, userType: 'user' } }
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
      localStorage.setItem('auth_user', JSON.stringify(authData.user));
    }

    return authData;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Verify password reset OTP
  verifyPasswordResetOTP: async (email: string, otp: string): Promise<{ verified: boolean; message: string }> => {
    const response = await apiClient.post('/api/auth/verify-password-reset-otp', { email, otp });
    return response.data.data || response.data;
  },

  // Reset password
  resetPassword: async (email: string, otp: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', { email, otp, password });
    return response.data;
  },

  // Verify email with OTP
  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/verify-email', { email, otp });

    const responseData = response.data;
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_type', 'user');
      localStorage.setItem('auth_user', JSON.stringify(authData.user));
    }

    return authData;
  },

  // Resend verification OTP
  resendVerificationOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/resend-otp', { email });
    return response.data;
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
