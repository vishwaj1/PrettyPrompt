// components/TemplatesNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  industries: string[]
  yourSearches: { id: string; industry: string; topic: string }[]
}

export function TemplatesNav({ industries, yourSearches }: Props) {
  const pathname = usePathname()
  const activeSlug = pathname?.split('/').pop()
  const activeSlugDecoded = decodeURIComponent(activeSlug as string)

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
      {/* Your Searches Section */}
      <div
        className="
          px-6 py-4
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-300 dark:border-gray-700
          rounded-md mb-2
        "
      >
        <h3
          className="
            text-sm font-medium uppercase tracking-wide
            text-gray-700 dark:text-gray-200
          "
        >
          Your Searches
        </h3>
      </div>

      {/* → scrollable */}
      <ul className="overflow-y-auto max-h-32 divide-y divide-gray-200 dark:divide-gray-700 mb-4">
        {yourSearches.length > 0 ? (
          yourSearches.map(s => {
            const slug = decodeURIComponent(s.industry)
            const href = `/templates/${encodeURIComponent(slug)}?source=user`
            const isActive = activeSlug === slug
            return (
              <li key={s.id}>
                <Link
                  href={href}
                  className={`flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 rounded-none ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-l-4 border-blue-500'
                      : 'hover:bg-white hover:dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {isActive && <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />}
                    <span className="truncate font-medium">{s.industry}</span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">{s.topic}</span>
                </Link>
              </li>
            )
          })
        ) : (
          <li className="px-6 py-3 text-sm text-gray-500 dark:text-gray-500">No recent searches</li>
        )}
      </ul>

      {/* Industries Section */}
      <div
        className="
          px-6 py-4
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-300 dark:border-gray-700
          rounded-md mb-2
        "
      >
        <h3
          className="
            text-sm font-medium uppercase tracking-wide
            text-gray-700 dark:text-gray-200
          "
        >
          Industries
        </h3>
      </div>

      {/* → scrollable */}
      <ul className="overflow-y-auto max-h-auto divide-y divide-gray-200 dark:divide-gray-700">
        {industries.map(ind => {
          const slug = decodeURIComponent(ind)
          const href = `/templates/${encodeURIComponent(slug)}`
          const isActive = activeSlugDecoded === ind
          return (
            <li key={ind}>
              <Link
                href={href}
                className={`flex items-center px-6 py-3 text-sm transition-colors duration-200 rounded-none ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-l-4 border-blue-500'
                    : 'hover:bg-white hover:dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isActive && <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />}
                <span className="truncate font-medium">{ind}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
