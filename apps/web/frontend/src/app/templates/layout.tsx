'use client'
import { ReactNode, useState, useEffect, useCallback, Suspense } from 'react'
import { TemplatesNav } from '@/components/TemplateNav'
import { useSession }   from 'next-auth/react'

type UserSearch = {
  id: string;
  industry: string;
  topic: string;
};

type Template = {
  id:          string;
  industry:    string;
  topic:       string;
  prompt:      string;
  createdAt:   string;
};

function TemplatesLayoutContent({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [yourSearches, setYourSearches] = useState<UserSearch[]>([])

  // after saving, refresh the user's searches
  const fetchSearches = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/usertemplates')
    const data = await res.json()
    setYourSearches(data)
  }, [session])

  useEffect(() => { fetchSearches() }, [fetchSearches])

  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const industries = Array.from(new Set(templates.map(t => t.industry)));

  const doSearch = async () => {
    if (!query.trim()) return
    // 1) call FastAPI to generate templates
    const fast = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/templates`,{
        method: 'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({
             industry: query,
             count: 5,
            }),
      });
    const templates = await fast.json()
    // 2) save them under the current user
    await fetch('/api/usertemplates', {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ industry: query, templates })
    })
    // 3) refresh your searches
    setQuery('')
    await fetchSearches()
  }

  return (
    <div className="flex h-screen">
      {/* left nav */}
      <TemplatesNav
        industries={industries}
        yourSearches={yourSearches}
      />

      {/* right pane */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center bg-white p-4 border-b">
          <input
            type="text"
            placeholder="Search industry…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border rounded px-3 py-1 mr-2"
          />
          <button
            onClick={doSearch}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Search
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplatesLayoutContent>{children}</TemplatesLayoutContent>
    </Suspense>
  )
}
