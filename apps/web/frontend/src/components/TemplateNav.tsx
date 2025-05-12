// components/TemplatesNav.tsx
'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface Props {
  industries: string[]
  yourSearches: { id: string; industry: string; topic: string }[]
}

export function TemplatesNav({ industries, yourSearches }: Props) {
  const pathname = usePathname()             // e.g. "/templates/Tourism"
  const searchParams = useSearchParams()     // e.g. { source: "user" }
  const activeSlug = pathname?.split('/').pop()

  return (
    <aside className="w-64 bg-gray-50 dark:bg-zinc-900 border-r overflow-auto">
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-2">Your Searches</h2>
        {yourSearches.length === 0 ? (
          <p className="text-sm text-gray-500">None yet</p>
        ) : (
          <ul className="space-y-1">
            {yourSearches.map(s => {
              const slug = decodeURIComponent(s.industry)
              const href = `/templates/${encodeURIComponent(slug)}?source=user`
              const isActive =
                activeSlug === slug && searchParams.get('source') === 'user'

              return (
                <li key={s.id}>
                  <Link
                    href={href}
                    className={`block px-3 py-1 rounded ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {s.industry} → {s.topic}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <hr />

      <section className="p-4">
        <h2 className="text-lg font-semibold mb-2">Industries</h2>
        <ul className="space-y-1">
          {industries.map(ind => {
            const slug = decodeURIComponent(ind)
            const href = `/templates/${encodeURIComponent(slug)}`
            const isActive =
              activeSlug === slug && !searchParams.get('source')

            return (
              <li key={ind}>
                <Link
                  href={href}
                  className={`block px-3 py-1 rounded ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  {ind}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
