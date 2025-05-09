// src/app/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TemplatesNav } from '@/components/TemplateNav'

type Template = {
  id:          string;
  industry:    string;
  topic:       string;
  prompt:      string;
  createdAt:   string;
};


export default function TemplatesIndexPage() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const industries = Array.from(new Set(templates.map(t => t.industry)));

  return (
    <div className="flex h-full min-h-screen">
      <TemplatesNav industries={industries} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Select an industry →</h2>
        <p className="text-sm text-gray-500">
          Pick one of the industries on the left to view its templates.
        </p>
      </main>
    </div>
  )
}




