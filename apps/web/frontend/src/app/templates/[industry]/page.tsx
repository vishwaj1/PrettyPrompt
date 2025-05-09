// app/templates/[industry]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams }        from 'next/navigation'
import { TemplatesNav }     from '@/components/TemplateNav'
import { slugify }        from '@/lib/slug'

type Template = {
  id:       string
  industry: string  // this should be the slug, e.g. "e-commerce"
  topic:    string
  prompt:   string
}

export default function IndustryTemplatesPage() {
  const { industry } = useParams()!
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  // derive the set of all industry‐slugs for the sidebar
  const industries = Array.from(new Set(templates.map(t => t.industry)))
  const rawParam = decodeURIComponent(industry as string)
  const filtered = templates.filter(t =>
    slugify(t.industry) === slugify(rawParam)
  )
  // ◀— HERE: only keep those matching the current slug
  

  return (
    <div className="flex h-full min-h-screen">
      <TemplatesNav industries={industries} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {(rawParam as string)} Templates
        </h2>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No templates found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(t => (
              <div
                key={t.id}
                className="border rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-900"
              >
                <h3 className="font-medium text-lg mb-1">{t.topic}</h3>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-zinc-800 p-2 rounded text-gray-800 dark:text-zinc-100 mb-3">
                  {t.prompt}
                </pre>
                <button
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('load-template', { detail: t.prompt })
                    )
                  }
                >
                  Use this template
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
