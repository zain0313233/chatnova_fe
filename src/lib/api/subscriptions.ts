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

export const subscriptionApi = {
  // Fixed: Now returns the checkout URL instead of redirecting
  createCheckout: async (tier: BundleTier, billingCycle: BillingCycle = 'monthly') => {
    const response = await apiClient.post('/api/subscriptions/create', {
      tier,
      billingCycle,
    });
    // Return the data so the component can handle the redirect
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