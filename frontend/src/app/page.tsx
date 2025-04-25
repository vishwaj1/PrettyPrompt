'use client';

import { useState } from 'react';

/* ---------- Data contracts that mirror the FastAPI responses ---------- */

interface Analysis {
  intent: string;
  constraints: string[] | null;
  desired_format: string | null;
  tone: string | null;
  gaps: string[] | null;
}

interface ImprovementSuggestions {
  items: string[];
}

/* ---------- Component ---------- */

export default function PromptlyPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tips, setTips] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /* ----- network helpers ----- */
  const apiBase = 'http://127.0.0.1:8000';

  const analyzePrompt = async (): Promise<Analysis> => {
    const res = await fetch(`${apiBase}/analyze-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const detail = (await res.json()).detail as string | undefined;
      throw new Error(detail ?? res.statusText);
    }
    return (await res.json()) as Analysis;
  };

  const fetchImprovements = async (): Promise<string[]> => {
    const res = await fetch(`${apiBase}/suggest-improvements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const detail = (await res.json()).detail as string | undefined;
      throw new Error(detail ?? res.statusText);
    }
    const data = (await res.json()) as ImprovementSuggestions;
    return data.items;
  };

  /* ----- click handler ----- */
  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);
    setTips(null);

    try {
      const result = await analyzePrompt();
      setAnalysis(result);

      const suggestions = await fetchImprovements();
      setTips(suggestions);
    } catch (err) {
      setError((err as Error).message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">Promptly — Prompt Analyzer</h1>

      <textarea
        className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring"
        placeholder="Paste your prompt here…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
        disabled={loading || !prompt.trim()}
        onClick={handleAnalyze}
      >
        {loading ? 'Analyzing…' : 'Analyze'}
      </button>

      {/* Error banner */}
      {error && (
        <p className="mt-4 text-red-600 font-medium">{error}</p>
      )}

      {/* Analysis JSON */}
      {analysis && (
        <pre className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{JSON.stringify(analysis, null, 2)}
        </pre>
      )}

      {/* Improvement tips */}
      {tips && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Improvement tips</h2>
          <ul className="list-disc list-inside space-y-1">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
