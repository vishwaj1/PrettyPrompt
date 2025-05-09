// src/app/templates/page.tsx
'use client';
import Link from 'next/link';

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Prompt Templates</h1>
      <p>Select an industry to browse or generate prompt templates.</p>

      <div className="flex gap-4">
        {['legal','medical','e-commerce','marketing','hr'].map(ind => (
          <Link
            key={ind}
            href={`/templates/${ind}`}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {ind.charAt(0).toUpperCase()+ind.slice(1)}
          </Link>
        ))}
      </div>
    </main>
  );
}
