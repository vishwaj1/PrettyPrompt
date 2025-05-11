// components/TemplatesNav.tsx
'use client'

import { slugify } from '@/lib/slug'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  industries: string[]
}

export function TemplatesNav({ industries }: Props) {
  const pathname = usePathname()               // e.g. "/templates/e-commerce"
  const activeSlug = pathname?.split('/').pop()

  return (
    <aside className="sticky top-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm">
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-100">
          Industries
        </h2>
      </div>
      <nav className="px-2">
        <ul className="space-y-1">
          {industries.map(ind => {
            const slug = slugify(ind)
            const isActive = slug === activeSlug
            return (
              <li key={ind}>
                <Link
                  href={`/templates/${slug}`}
                  className={`
                    relative flex items-center px-4 py-2 rounded-lg transition
                    ${isActive
                      ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}
                  `}
                >
                  {/* left pill indicator */}
                  <span
                    className={`
                      absolute left-0 h-full w-1 rounded-r-lg
                      ${isActive
                        ? 'bg-blue-600 dark:bg-emerald-400'
                        : 'bg-transparent'}
                    `}
                  />
                  {/* industry name */}
                  <span className="ml-2">{ind}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
