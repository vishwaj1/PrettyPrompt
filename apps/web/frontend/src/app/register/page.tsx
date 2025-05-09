// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  // Track which step we're on
  const [step, setStep] = useState<'request' | 'verify'>('request');

  // Common fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [code, setCode]         = useState(''); // OTP code

  // Email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Step 1: request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Invalid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setBusy(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email}),
      });
      let data;
      try {
        data = await res.json()
      } catch (e) {
        console.error('Invalid JSON response:', e)
      }
      if (!res.ok) {
        setError(data.detail || 'Failed to send OTP.');
      } else {
        setStep('verify');
      }
    } catch (err) {
      console.error(err);
      setError('Network error sending OTP.');
    } finally {
      setBusy(false);
    }
  };

  // Step 2: verify OTP and create account
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.match(/^\d{6}$/)) return setError('Enter a valid 6-digit code.');

    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'OTP verification failed.');
        setBusy(false);
        return;
      }
      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/',
      });
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      } else {
        window.location.href = result?.url ?? '/';
      }
    } catch (err) {
      console.error(err);
      setError('Network error verifying OTP.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      

      <main className="mx-auto max-w-md p-6 mt-12">
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-lg p-8 border border-blue-100 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700 dark:text-emerald-400">
            {step === 'request' ? 'Create your account' : 'Verify your email'}
          </h2>

          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow hover:from-blue-700 hover:to-emerald-600 transition disabled:opacity-60"
              >
                {busy ? 'Sending code…' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Enter the 6‑digit code sent to your email
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition tracking-widest"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow hover:from-blue-700 hover:to-emerald-600 transition disabled:opacity-60"
              >
                {busy ? 'Verifying…' : 'Verify & Sign Up'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="underline text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

