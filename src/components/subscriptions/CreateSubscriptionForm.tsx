'use client';

import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { subscriptionApi, BundleTier } from '@/lib/api/subscriptions';

interface Plan {
  tier: BundleTier;
  name: string;
  price: string;
  messages: number;
  icon: any;
  color: string;
  popular: boolean;
  features: string[];
}

const plans: Plan[] = [
  { 
    tier: 'basic',
    name: 'Basic', 
    price: '9', 
    messages: 100,
    icon: Zap,
    color: 'from-emerald-400 to-emerald-500',
    popular: false,
    features: [
      '100 messages per month',
      'Basic AI models',
      'Email support',
      'Standard response time'
    ]
  },
  { 
    tier: 'pro',
    name: 'Standard', 
    price: '29', 
    messages: 500,
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    popular: true,
    features: [
      '500 messages per month',
      'Advanced AI models',
      'Priority support',
      'Faster response time',
      'GPT-4 access'
    ]
  },
  { 
    tier: 'enterprise',
    name: 'Pro', 
    price: '79', 
    messages: 1000,
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    popular: false,
    features: [
      '1000 messages per month',
      'All AI models',
      '24/7 priority support',
      'Fastest response time',
      'Custom integrations'
    ]
  },
];

interface CreateSubscriptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateSubscriptionForm({ onSuccess, onCancel }: CreateSubscriptionFormProps) {
  const handleChoosePlan = async (tier: BundleTier) => {
    try {
      const response: any = await subscriptionApi.createCheckout(tier, 'monthly');
      
      const checkoutUrl = response?.data?.checkoutUrl || response?.checkoutUrl;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        onSuccess();
      } else {
        console.error('Response:', response);
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      alert('Failed to start checkout. Check console.');
      console.error('Checkout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Pricing Plans
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your <span className="text-blue-600">Power Level</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Choose a plan that works best for you and your team
          </p>
          <button 
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 text-sm underline transition-colors"
          >
            Cancel and Go Back
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.tier}
                className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-xl ${
                  isPopular 
                    ? 'border-blue-500 scale-105' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-slate-600 text-sm">€</span>
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-1">/user</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleChoosePlan(plan.tier)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Choose Plan →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            💳 Test with card: <span className="font-mono text-slate-700">4242 4242 4242 4242</span> • Any future date • Any CVC
          </p>
        </div>
      </div>
    </div>
  );
}