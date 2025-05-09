// src/app/templates/[industry]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Template = { id: string; name: string; snippet: string };

export default function IndustryTemplatesPage() {
  const params = useParams();
  const industry = params.industry as string;

  const [templates, setTemplates] = useState<Template[]>([]);
  useEffect(() => {
    fetch(`http://localhost:8000/templates/${industry}`)
      .then(r => r.json())
      .then(setTemplates);
  }, [industry]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">{industry} Templates</h1>
      <ul className="space-y-3">
        {templates.map(t => (
          <li key={t.id} className="border p-4 rounded">
            <h3 className="font-semibold">{t.name}</h3>
            <pre className="whitespace-pre-wrap">{t.snippet}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}
