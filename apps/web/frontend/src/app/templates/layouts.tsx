// app/templates/layout.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Templates • PrettyPrompt',
}

export default function TemplatesLayout({
  children,
}: {
  children: ReactNode
}) {
  // You might fetch your templates once here and derive industries,
  // or pass them down via context—simplest is a static list for demo:
  const industries = ['legal','medical','e-commerce','marketing','hr']

  return (
    <div className="flex h-full min-h-screen">
      {/* Persistent Sidebar */}
      <nav className="w-60 border-r border-gray-200 dark:border-zinc-800 overflow-y-auto">
        <ul className="py-4">
          {industries.map((ind) => (
            <li key={ind}>
              <Link
                href={`/templates/${encodeURIComponent(ind)}`}
                className={`
                  block w-full text-left px-4 py-2 text-sm font-medium rounded-r-lg
                  hover:bg-gray-100 dark:hover:bg-zinc-700
                  text-gray-700 dark:text-zinc-300
                `}
              >
                {ind}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Outlet for child pages */}
      <div className="flex-1 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
