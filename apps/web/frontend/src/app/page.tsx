// src/app/page.tsx
import Link from 'next/link';
// import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 min-h-screen">
      {/* Hero */}
      <section className="w-full max-w-4xl text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 dark:text-emerald-400 mb-4">
          Welcome to PrettyPrompt 🚀
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-zinc-300 mb-8">
          Instantly transform your ideas into high-impact LLM prompts – rewrite, shorten, expand, and benchmark across all your favorite models.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/templates"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Browse Templates
          </Link>
          <Link
            href="/prettyprompt"
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold shadow hover:bg-blue-50 transition"
          >
            Try the Prompt Editor
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-4xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-emerald-400 mb-8">
          Why PrettyPrompt?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-lg transition">
            {/* <Image src="/icons/edit.svg" alt="" width={48} height={48} className="mx-auto mb-4" /> */}
            <h3 className="text-xl font-semibold mb-2">Smart Rewriting</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Improve clarity, specificity, and tone with industry-tailored rewrite modes.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-lg transition">
            {/* <Image src="/icons/compare.svg" alt="" width={48} height={48} className="mx-auto mb-4" /> */}
            <h3 className="text-xl font-semibold mb-2">Instant Benchmarking</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Compare original vs. improved prompts across multiple LLMs side by side.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow hover:shadow-lg transition">
            {/* <Image src="/icons/library.svg" alt="" width={48} height={48} className="mx-auto mb-4" /> */}
            <h3 className="text-xl font-semibold mb-2">Custom Templates</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Explore industry-specific prompt libraries or create your own reusable stencils.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="w-full bg-blue-600 dark:bg-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Started in Seconds</h2>
          <p className="mb-8">
            No installation required – just sign in, paste your raw prompt, and hit “Rewrite.” Check out templates or dive straight into the editor.
          </p>
          <Link
            href="/prettyprompt"
            className="px-8 py-4 bg-white text-blue-600 dark:text-emerald-700 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
          >
            Launch Prompt Editor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl px-4 py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
        © {new Date().getFullYear()} PrettyPrompt • Crafted with care for prompt engineers.
      </footer>
    </main>
  );
}
