'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { ForgotPasswordSchema, authApi, ResetPasswordSchema } from '@/lib/api/auth';
import AuthLeftCard from '@/components/auth/AuthLeftCard';

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    try {
      ForgotPasswordSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
    } catch (error: any) {
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyPasswordResetOTP(email, otp);
      setStep('reset');
    } catch (error: any) {
      let errorMessage = 'Invalid or expired OTP. Please try again.';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    try {
      ResetPasswordSchema.parse({ token: otp, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, password);
      router.push('/login');
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character';
    return undefined;
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <AuthLeftCard />
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md py-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              {step === 'email' && "Enter your email address and we'll send you a verification code."}
              {step === 'otp' && 'Enter the 6-digit code sent to your email.'}
              {step === 'reset' && 'Enter your new password.'}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
                  {apiError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                    if (apiError) setApiError(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:text-base ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-4 sm:space-y-6">
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
                  {apiError}
                </div>
              )}

              <div>
                <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    if (errors.otp) setErrors({ ...errors, otp: '' });
                    if (apiError) setApiError(null);
                  }}
                  maxLength={6}
                  className={`w-full rounded-lg border px-3 py-2.5 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 ${
                    errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.otp}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to {email}</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                ← Change email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4 sm:space-y-6">
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
                  {apiError}
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                      if (apiError) setApiError(null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:pr-12 sm:text-base ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 sm:right-3"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      if (apiError) setApiError(null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:pr-12 sm:text-base ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 sm:right-3"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center sm:mt-6">
            <p className="text-xs text-gray-600 sm:text-sm">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
