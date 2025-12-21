// src/lib/api/subscriptions.ts

import apiClient from './client';
import { z } from 'zod';

export const BundleTierSchema = z.enum(['basic', 'pro', 'enterprise']);
export const BillingCycleSchema = z.enum(['monthly', 'yearly']);

const CheckoutSessionSchema = z.object({
  checkoutUrl: z.string().url(),
});

export type BundleTier = z.infer<typeof BundleTierSchema>;
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  maxMessages: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionApi = {
  // Get all active plans
  getPlans: async (): Promise<Plan[]> => {
    const response = await apiClient.get('/api/subscriptions/plans');
    return response.data.data || [];
  },

  // Create checkout session with planId (new method)
  createCheckoutWithPlan: async (planId: string) => {
    const response = await apiClient.post('/api/subscriptions/create', {
      planId,
    });
    return response.data;
  },

  // Legacy: Create checkout with tier and billingCycle
  createCheckout: async (tier: BundleTier, billingCycle: BillingCycle = 'monthly') => {
    const response = await apiClient.post('/api/subscriptions/create', {
      tier,
      billingCycle,
    });
    return response.data;
  },

  getAll: async () => {
    const res = await apiClient.get('/api/subscriptions');
    return res.data.data || [];
  },

  getActive: async () => {
    const res = await apiClient.get('/api/subscriptions/active');
    return res.data.data || [];
  },

  cancel: async (subscriptionId: string) => {
    const res = await apiClient.post(`/api/subscriptions/${subscriptionId}/cancel`);
    return res.data.data;
  },
};