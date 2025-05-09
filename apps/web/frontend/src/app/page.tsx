import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8 text-center">
      <h2 className="text-4xl font-extrabold text-blue-700 dark:text-emerald-400">
        Welcome to PrettyPrompt 🚀
      </h2>
      <p className="text-lg text-gray-700 dark:text-zinc-300">
        Craft clearer, model-ready prompts & benchmark them instantly.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <Link
          href="/templates"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Browse Templates
        </Link>
        <Link
          href="/prettyprompt"
          className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Try the Prompt Editor
        </Link>
      </div>
    </main>
  );
}
