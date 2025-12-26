'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { subscriptionApi, Plan } from '@/lib/api/subscriptions';
import { API_CONFIG } from '@/lib/config';

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();

    // Check for success/cancel messages
    if (searchParams.get('success') === 'true') {
      // Show success message
      setTimeout(() => {
        router.push('/subscriptions?success=true');
      }, 2000);
    }
  }, [searchParams, router]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionApi.getPlans();
      // Sort by sortOrder, then by price
      const sorted = data.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.price - b.price;
      });
      setPlans(sorted);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load plans. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login?redirect=/plans');
      return;
    }

    setLoadingPlanId(plan.id);
    setError(null);

    try {
      const response = await subscriptionApi.createCheckoutWithPlan(plan.id);

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create checkout session. Please try again.';
      setError(errorMessage);
      setLoadingPlanId(null);
    }
  };

  const getTierColor = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('basic')) return 'from-emerald-400 to-emerald-500';
    if (tierLower.includes('pro') || tierLower.includes('standard')) return 'from-blue-500 to-blue-600';
    if (tierLower.includes('enterprise') || tierLower.includes('premium')) return 'from-purple-500 to-purple-600';
    return 'from-gray-400 to-gray-500';
  };

  const getTierIcon = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('basic')) return '⚡';
    if (tierLower.includes('pro') || tierLower.includes('standard')) return '✨';
    if (tierLower.includes('enterprise') || tierLower.includes('premium')) return '👑';
    return '📦';
  };

  return (
    <ProtectedRoute>
      <LayoutWrapper>
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Choose Your Plan
              </h1>
              <p className="mt-2 text-base text-gray-600 sm:text-lg">
                Select the perfect plan for your needs
              </p>
            </div>

            {/* Success Message */}
            {searchParams.get('success') === 'true' && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                Payment successful! Redirecting to subscriptions...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Loading plans...</p>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-600">No plans available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border-2 bg-white p-6 shadow-sm transition hover:shadow-md ${plan.isPopular
                      ? 'border-purple-500 ring-2 ring-purple-500'
                      : 'border-gray-200'
                      }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${getTierColor(plan.tier)} text-2xl text-white`}>
                        {getTierIcon(plan.tier)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      {plan.description && (
                        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price.toFixed(2)}
                        </span>
                        <span className="ml-1 text-sm text-gray-600">
                          /{plan.billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {plan.billingCycle === 'yearly' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Save ${((plan.price / 12) * 12 - plan.price).toFixed(2)} per year
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {plan.maxMessages === 999999 ? 'Unlimited' : plan.maxMessages.toLocaleString()} Messages
                        </span>
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-600">
                              <svg
                                className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlanId === plan.id}
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${plan.isPopular
                        ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                        : 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-500'
                        }`}
                    >
                      {loadingPlanId === plan.id ? 'Processing...' : 'Subscribe Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-600">
                All plans include secure payment processing via Stripe
              </p>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    </ProtectedRoute>
  );
}

