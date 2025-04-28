'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-700">PrettyPrompt</h1>
        <nav className="flex gap-4">
          <Link href="/api/auth/login" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Sign In
          </Link>
          <Link href="/api/auth/register" className="px-4 py-2 rounded bg-gray-200 text-blue-700 hover:bg-gray-300">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome to PrettyPrompt!</h2>
        <p className="mb-4">
          <span className="font-bold">PrettyPrompt</span> is your AI-powered prompt improvement and benchmarking tool.
          Instantly rewrite, enhance, and compare prompts across top LLMs like GPT-4o, Claude, Gemini, and more.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Rewrite prompts for clarity, tone, or length</li>
          <li>Benchmark prompt quality across multiple models</li>
          <li>Get actionable improvement tips</li>
          <li>Sign in to save and track your prompt history</li>
        </ul>
        <p>
          Get started by signing in or signing up!
        </p>
      </main>
    </div>
  );
}