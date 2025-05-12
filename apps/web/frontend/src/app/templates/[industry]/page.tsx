'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ClipboardIcon }    from '@heroicons/react/24/outline'

type Template = {
  id:       string
  industry: string
  topic:    string
  prompt:   string
}

function IndustryTemplatesContent() {
  const { industry }    = useParams() || {}
  const searchParams    = useSearchParams()
  const source          = searchParams.get('source')
  const [templates, setTemplates] = useState<Template[]>([])
  const [copiedId, setCopiedId]   = useState<string | null>(null)

  // turn "e-commerce" → "E-commerce Templates"
  const title = industry
    ? decodeURIComponent(industry as string)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    : ''

  // Fetch whenever industry or source changes
  useEffect(() => {
    if (!industry) return

    const url =
      source === 'user'
        ? `/api/usertemplates/${encodeURIComponent(industry as string)}`
        : `/api/templates?industry=${encodeURIComponent(industry as string)}`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: Template[]) => setTemplates(data))
      .catch(console.error)
  }, [industry, source])

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {title} Templates
      </h2>

      {templates.length === 0 ? (
        <p className="text-sm text-gray-500">
          No {source === 'user' ? 'your ' : ''}templates found for {title}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <div
              key={t.id}
              className="relative border rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-900"
            >
              {/* COPY ICON */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(t.prompt)
                  setCopiedId(t.id)
                  setTimeout(() => setCopiedId(null), 1500)
                }}
                className="absolute top-3 right-3 p-1 focus:outline-none"
              >
                {copiedId === t.id ? (
                  <span className="text-green-600 text-xs font-medium">
                    Copied!
                  </span>
                ) : (
                  <ClipboardIcon className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200" />
                )}
              </button>

              {/* TOPIC */}
              <h3 className="font-medium text-lg mb-1">{t.topic}</h3>

              {/* PROMPT */}
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-zinc-800 p-2 rounded text-gray-800 dark:text-zinc-100 mb-3">
                {t.prompt}
              </pre>

              {/* "Use this template" BUTTON */}
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
  )
}

export default function IndustryPage() {
  return (
    <Suspense fallback={<div>Loading templates…</div>}>
      <IndustryTemplatesContent />
    </Suspense>
  )
}
