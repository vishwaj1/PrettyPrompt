// components/TemplatesNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { slugify,unslugify }     from '@/lib/slug'

interface Props {
  industries: string[]
  yourSearches: { id: string; industry: string; topic: string }[]
}

export function TemplatesNav({ industries, yourSearches }: Props) {
  const pathname = usePathname()
  const active = pathname?.split('/').pop()

  return (
    <aside className="w-64 bg-gray-50 dark:bg-zinc-900 border-r overflow-auto">
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-2">Your Searches</h2>
        {yourSearches.length === 0 ? (
          <p className="text-sm text-gray-500">None yet</p>
        ) : (
          <ul className="space-y-1">
            {yourSearches.map(s => {
              const slug = unslugify(s.industry)
              return (
                <li key={s.id}>
                  <Link
                    href={`/templates/${slug}`}
                    className={`block px-3 py-1 rounded ${
                      active === slug
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
            const slug = slugify(ind)
            return (
              <li key={ind}>
                <Link
                  href={`/templates/${slug}`}
                  className={`block px-3 py-1 rounded ${
                    active === slug
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
