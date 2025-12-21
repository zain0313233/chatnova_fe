import { adminApiClient } from './adminClient';
import { z } from 'zod';

// Admin Auth Response Schema
export const AdminAuthResponseSchema = z.object({
  token: z.string(),
  admin: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
});

export type AdminAuthResponse = z.infer<typeof AdminAuthResponseSchema>;

// Dashboard Stats Schema
export const AdminDashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalMessages: z.number(),
  activeSubscriptions: z.number(),
  totalRevenue: z.number(),
  newUsersThisMonth: z.number(),
  messagesThisMonth: z.number(),
  revenueThisMonth: z.number(),
});

export type AdminDashboardStats = z.infer<typeof AdminDashboardStatsSchema>;

// User List Item Schema
export const UserListItemSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.string(),
  totalMessages: z.number(),
  activeSubscriptions: z.number(),
});

export type UserListItem = z.infer<typeof UserListItemSchema>;

// Subscription List Item Schema
export const SubscriptionListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  tier: z.string(),
  billingCycle: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  messagesUsed: z.number(),
  maxMessages: z.number(),
});

export type SubscriptionListItem = z.infer<typeof SubscriptionListItemSchema>;

// Message List Item Schema
export const MessageListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  question: z.string(),
  answer: z.string(),
  tokens: z.number(),
  createdAt: z.string(),
});

export type MessageListItem = z.infer<typeof MessageListItemSchema>;

// Paginated Response Schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  });

export const adminApi = {
  // Admin login
  login: async (email: string, password: string): Promise<AdminAuthResponse> => {
    const response = await adminApiClient.getClient().post('/api/admin/auth/signin', {
      email,
      password,
    });

    const responseData = response.data;
    const token = responseData?.data?.token || responseData?.token;
    const admin = responseData?.data?.admin || responseData?.admin;

    if (!token || !admin) {
      throw new Error('Invalid response format: missing token or admin data');
    }

    const authData: AdminAuthResponse = {
      token,
      admin,
    };

    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(admin));
    }

    return authData;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await adminApiClient.getClient().get('/api/admin/dashboard/stats');
    const responseData = response.data?.data || response.data;
    return AdminDashboardStatsSchema.parse(responseData);
  },

  // Get all users
  getUsers: async (page: number = 1, limit: number = 20, search?: string): Promise<{
    users: UserListItem[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await adminApiClient.getClient().get(`/api/admin/users?${params.toString()}`);
    const responseData = response.data?.data || response.data;
    
    return {
      users: responseData.users.map((u: any) => UserListItemSchema.parse(u)),
      total: responseData.total,
      page: responseData.page,
      limit: responseData.limit,
    };
  },

  // Get all subscriptions
  getSubscriptions: async (page: number = 1, limit: number = 20, search?: string): Promise<{
    subscriptions: SubscriptionListItem[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await adminApiClient.getClient().get(`/api/admin/subscriptions?${params.toString()}`);
    const responseData = response.data?.data || response.data;
    
    return {
      subscriptions: responseData.subscriptions.map((s: any) => SubscriptionListItemSchema.parse(s)),
      total: responseData.total,
      page: responseData.page,
      limit: responseData.limit,
    };
  },

  // Get all messages
  getMessages: async (page: number = 1, limit: number = 20, search?: string): Promise<{
    messages: MessageListItem[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await adminApiClient.getClient().get(`/api/admin/messages?${params.toString()}`);
    const responseData = response.data?.data || response.data;
    
    return {
      messages: responseData.messages.map((m: any) => MessageListItemSchema.parse(m)),
      total: responseData.total,
      page: responseData.page,
      limit: responseData.limit,
    };
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await adminApiClient.getClient().delete(`/api/admin/users/${userId}`);
  },

  // Admin forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await adminApiClient.getClient().post('/api/admin/auth/forgot-password', { email });
    return response.data;
  },

  // Verify password reset OTP for admin
  verifyPasswordResetOTP: async (email: string, otp: string): Promise<{ verified: boolean; message: string }> => {
    const response = await adminApiClient.getClient().post('/api/admin/auth/verify-password-reset-otp', { email, otp });
    return response.data.data || response.data;
  },

  // Reset password for admin
  resetPassword: async (email: string, otp: string, password: string): Promise<{ message: string }> => {
    const response = await adminApiClient.getClient().post('/api/admin/auth/reset-password', { email, otp, password });
    return response.data;
  },

  // Plan Management
  getPlans: async (activeOnly: boolean = false): Promise<any[]> => {
    const response = await adminApiClient.getClient().get(`/api/admin/plans${activeOnly ? '?activeOnly=true' : ''}`);
    return response.data.data || [];
  },

  getPlanById: async (planId: string): Promise<any> => {
    const response = await adminApiClient.getClient().get(`/api/admin/plans/${planId}`);
    return response.data.data;
  },

  createPlan: async (planData: {
    name: string;
    description?: string;
    tier: string;
    billingCycle: 'monthly' | 'yearly';
    price: number;
    maxMessages: number;
    features?: string[];
    isPopular?: boolean;
    sortOrder?: number;
  }): Promise<any> => {
    const response = await adminApiClient.getClient().post('/api/admin/plans', planData);
    return response.data.data;
  },

  updatePlan: async (planId: string, planData: Partial<{
    name: string;
    description?: string;
    tier: string;
    billingCycle: 'monthly' | 'yearly';
    price: number;
    maxMessages: number;
    features?: string[];
    isActive?: boolean;
    isPopular?: boolean;
    sortOrder?: number;
  }>): Promise<any> => {
    const response = await adminApiClient.getClient().put(`/api/admin/plans/${planId}`, planData);
    return response.data.data;
  },

  deletePlan: async (planId: string): Promise<void> => {
    await adminApiClient.getClient().delete(`/api/admin/plans/${planId}`);
  },
};

