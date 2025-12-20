'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentSuccessPopup from '@/components/subscriptions/PaymentSuccessPopup';
import { API_CONFIG } from '@/lib/config';

// Simple Check Icon Component
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// You might want to move this to a shared types file or config
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    features: ['100 Messages/month', 'Basic Support', 'Standard Response Time'],
    tier: 'basic',
  },
  {
    id: 'standard', // Maps to PRO in backend
    name: 'Standard',
    price: 29,
    features: ['500 Messages/month', 'Priority Support', 'Faster Response Time', 'Access to GPT-4'],
    tier: 'pro',
    popular: true,
  },
  {
    id: 'pro', // Maps to ENTERPRISE in backend
    name: 'Pro',
    price: 79,
    features: ['1000 Messages/month', '24/7 Support', 'Fastest Response Time', 'Access to all models'],
    tier: 'enterprise',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Check if redirected from Stripe with success
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccessPopup(true);
      // Clean up URL
      window.history.replaceState({}, '', '/pricing');
    }
  }, [searchParams]);

  const handleSubscribe = async (tier: string) => {
    setLoading(tier);
    setError(null);

    try {
      // Get token from localStorage or your auth context
      const token = localStorage.getItem('auth_token'); 
      
      if (!token) {
        router.push('/login?redirect=/pricing');
        return;
      }

      const response = await fetch(`${API_CONFIG.getBaseURL()}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          billingCycle: 'monthly', // Hardcoded for now as per requirements
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create subscription');
      }

      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        {error && (
          <div className="mt-8 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col ${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-500 relative' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-4 mr-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading === plan.tier}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white transition-colors ${
                    loading === plan.tier
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading === plan.tier ? 'Processing...' : 'Choose Plan'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6 flex-1">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <PaymentSuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}
    </div>
  );
}
