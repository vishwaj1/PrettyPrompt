// components/TemplatesNav.tsx
'use client'

import { slugify } from '@/lib/slug'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
interface Props {
  industries: string[]
}

export function TemplatesNav({ industries }: Props) {
  const pathname = usePathname()  // e.g. "/templates/e-commerce"
  const active = pathname?.split('/').pop()  // last segment

  return (
    <nav className="w-60 border-r border-gray-200 dark:border-zinc-800 overflow-y-auto">
      <ul className="py-4">
        {industries.map((ind) => {
          const isActive = active === (slugify(ind))
          return (
            <li key={ind}>
              <Link

                href={`/templates/${slugify(ind)}`}
                className={`
                  block w-full text-left px-4 py-2 text-sm font-medium rounded-r-lg transition
                  ${isActive
                    ? 'bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-emerald-400'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300'}
                `}
              >
                {ind}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
