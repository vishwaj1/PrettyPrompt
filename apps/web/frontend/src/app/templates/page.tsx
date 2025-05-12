// src/app/templates/page.tsx
'use client'
import { Suspense } from 'react'

function TemplatesIndexPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Select an industry →</h2>
      <p className="text-sm text-gray-500">
        Pick one of the industries on the left or search above.
      </p>
    </>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div>Loading templates…</div>}>
      <TemplatesIndexPage />
    </Suspense>
  )
}