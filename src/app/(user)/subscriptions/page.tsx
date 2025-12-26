'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { subscriptionApi } from '@/lib/api/subscriptions';
import { SubscriptionBundle } from '@/types';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionApi.getAll();
      setSubscriptions(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load subscriptions. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();

    // Check for success parameter from Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Reload subscriptions after successful payment
      setTimeout(() => {
        loadSubscriptions();
      }, 1000);
    }
  }, []);

  const handleSubscriptionUpdate = () => {
    loadSubscriptions();
  };

  const handleUpgrade = () => {
    router.push('/plans');
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);
  const currentSubscription = activeSubscriptions[0]; // Most recent active subscription

  return (
    <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Subscriptions
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Manage your subscription bundles and billing
          </p>
        </div>

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
              <p className="mt-4 text-gray-600">Loading subscriptions...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Side - Current Subscription */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Current Subscription
                </h2>

                {currentSubscription ? (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Plan</span>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {currentSubscription.tier}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">Billing Cycle</span>
                      <p className="text-sm text-gray-600 capitalize">
                        {currentSubscription.billingCycle}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">Messages</span>
                      <p className="text-sm text-gray-600">
                        {currentSubscription.messagesUsed} / {currentSubscription.maxMessages}
                      </p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-purple-600 transition-all"
                          style={{
                            width: `${Math.min((currentSubscription.messagesUsed / currentSubscription.maxMessages) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">Price</span>
                      <p className="text-lg font-semibold text-gray-900">
                        ${currentSubscription.price.toFixed(2)} / {currentSubscription.billingCycle === 'monthly' ? 'month' : 'year'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">Renewal Date</span>
                      <p className="text-sm text-gray-600">
                        {currentSubscription.renewalDate
                          ? new Date(currentSubscription.renewalDate).toLocaleDateString()
                          : new Date(currentSubscription.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={handleUpgrade}
                      className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="mb-4 text-sm text-gray-600">
                      No active subscription
                    </p>
                    <button
                      onClick={() => router.push('/plans')}
                      className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
                    >
                      Browse Plans
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - All Subscriptions Table */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Subscription History
                  </h2>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600">No subscriptions found</p>
                    <button
                      onClick={() => router.push('/plans')}
                      className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                    >
                      Browse Plans
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Billing
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Messages
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            End Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {subscriptions.map(subscription => (
                          <tr key={subscription.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {subscription.tier}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm text-gray-600 capitalize">
                                {subscription.billingCycle}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {subscription.messagesUsed} / {subscription.maxMessages}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                ${subscription.price.toFixed(2)}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {subscription.isActive ? (
                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {new Date(subscription.endDate).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
