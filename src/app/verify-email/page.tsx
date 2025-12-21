'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { VerifyEmailSchema, authApi } from '@/lib/api/auth';
import AuthLeftCard from '@/components/auth/AuthLeftCard';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/features/auth/authSlice';

type VerifyEmailFormData = z.infer<typeof VerifyEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<VerifyEmailFormData>({
    email: '',
    otp: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VerifyEmailFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For OTP, only allow numbers and limit to 6 digits
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors
    if (errors[name as keyof VerifyEmailFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError(null);
    if (resendSuccess) setResendSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    // Validate form
    try {
      VerifyEmailSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof VerifyEmailFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof VerifyEmailFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await authApi.verifyEmail(formData.email, formData.otp);
      
      // Update Redux store
      dispatch(setUser(result.user));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      setApiError('Please enter your email address first');
      return;
    }

    setIsResending(true);
    setApiError(null);
    setResendSuccess(false);

    try {
      await authApi.resendVerificationOTP(formData.email);
      setResendSuccess(true);
    } catch (error: any) {
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error?.message) {
          errorMessage = data.error.message;
        }
      }

      setApiError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <AuthLeftCard />
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md py-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              We've sent a 6-digit verification code to your email. Please enter it below.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <p className="font-medium">Email verified successfully!</p>
              <p className="mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
                  {apiError}
                </div>
              )}

              {resendSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-700 sm:px-4 sm:py-3 sm:text-sm">
                  A new verification code has been sent to your email.
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:text-base ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full rounded-lg border px-3 py-2.5 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 ${
                    errors.otp
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">
                    {errors.otp}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || !formData.email}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  {isResending ? 'Sending...' : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center sm:mt-6">
            <p className="text-xs text-gray-600 sm:text-sm">
              Already verified?{' '}
              <Link
                href="/login"
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

