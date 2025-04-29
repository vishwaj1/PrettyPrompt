'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [busy, setBusy]       = useState(false);

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
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Registration failed.');
        setBusy(false);
        return;
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/',
      });

      if (result?.error) {
        setError(result.error);
        setBusy(false);
        return;
      }

      window.location.href = result?.url ?? '/';
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen …">
      {/* header omitted for brevity */}
      <main className="…">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* email, password, confirm inputs */}
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2 …"
          >
            {busy ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="underline text-blue-700">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
