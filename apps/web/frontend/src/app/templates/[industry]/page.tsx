// components/IndustryTemplatesContent.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ClipboardIcon }    from '@heroicons/react/24/outline'
import { motion }           from 'framer-motion'

// Animation variants for cards
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
}

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
        ? `/api/usertemplates?industry=${encodeURIComponent(industry as string)}`
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
    <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-zinc-100 border-b-4 border-blue-500 inline-block pb-2">
        {title} Templates
      </h2>

      {templates.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-zinc-400 mt-20">
          No {source === 'user' ? 'your ' : ''}templates found for <span className="font-semibold">{title}</span>.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, idx) => (
            <motion.div
              key={t.id}
              className="relative bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-700 transition-shadow duration-300 hover:shadow-xl"
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileHover={{ scale: 1.02 }}
            >
              {/* CARD HEADER: Topic and Copy Button */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">
                  {t.topic}
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(t.prompt)
                    setCopiedId(t.id)
                    setTimeout(() => setCopiedId(null), 1500)
                  }}
                  className="p-1 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  {copiedId === t.id ? (
                    <span className="text-green-600 text-sm font-medium">Copied!</span>
                  ) : (
                    <ClipboardIcon className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
                  )}
                </button>
              </div>

              {/* PROMPT BODY */}
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg text-gray-800 dark:text-zinc-100 mb-6 border border-gray-100 dark:border-zinc-700">
                {t.prompt}
              </pre>

              {/* "Use this template" BUTTON */}
              <button
                className="mt-auto w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('load-template', { detail: t.prompt })
                  )
                }
              >
                Use this template
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}

export default function IndustryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading templates…</div>}>
      <IndustryTemplatesContent />
    </Suspense>
  )
}