'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Basic email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    // TODO: Replace with your registration API call
    try {
      // Example: await fetch('/api/register', { ... })
      // For now, just simulate success:
      setTimeout(() => {
        setBusy(false);
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-5 shadow-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-blue-100 dark:border-zinc-800 sticky top-0 z-20">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-emerald-400 tracking-tight">
          PrettyPrompt
        </h1>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </header>

      <main className="mx-auto max-w-md p-6 mt-12">
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-lg p-8 border border-blue-100 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700 dark:text-emerald-400">
            Create your account
          </h2>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-6 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-semibold shadow hover:from-blue-600 hover:to-emerald-500 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 32.9 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/>
                <path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.6 36 24 36 24 36c-5.6 0-10.1-3.1-12.4-7.6l-7 5.4C7.6 41.9 15.2 45 24 45z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-2 4.1-6.1 7-11.7 7-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/>
              </g>
            </svg>
            Sign up with Google
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && (
              <div className="text-red-600 text-sm font-medium">{error}</div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow hover:from-blue-700 hover:to-emerald-600 transition disabled:opacity-60"
            >
              {busy ? 'Signing up…' : 'Sign Up'}
            </button>
          </form>
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
