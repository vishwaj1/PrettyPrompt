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
  const [rewrite, setRewrite] = useState<string | null>(null);


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

  const fetchImprovements = async (currentTone: string | null): Promise<string[]> => {
    const res = await fetch(`${apiBase}/suggest-improvements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, tone: currentTone }),
    });
    if (!res.ok) {
      const detail = (await res.json()).detail as string | undefined;
      throw new Error(detail ?? res.statusText);
    }
    const data = (await res.json()) as ImprovementSuggestions;
    return data.items;
  };


  const fetchRewrite = async (): Promise<string> => {
    const res = await fetch(`${apiBase}/rewrite-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const detail = (await res.json()).detail as string | undefined;
      throw new Error(detail ?? res.statusText);
    }
    const data = (await res.json()) as { prompt: string };
    return data.prompt;
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

      const suggestions = await fetchImprovements(result.tone);//Summarize prompt
      setTips(suggestions);

      const improved = await fetchRewrite();   // Rewrite prompt
  setRewrite(improved);
    } catch (err) {
      setError((err as Error).message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">PrettyPrompt</h1>

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
        <>
        <pre className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
    {JSON.stringify(analysis, null, 2)}
        </pre>
    
        {/* Tone badge */}
        {analysis.tone && (
          <span className="inline-block mt-2 rounded-full bg-purple-600/10 px-3 py-1 text-sm font-medium text-purple-700">
            Tone: {analysis.tone}
          </span>
        )}
      </>
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

      {/* Rewrite prompt */}
      {rewrite && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Rewritten prompt</h2>

            <div className="relative">
              <textarea
                className="w-full h-48 p-3 pr-14 border rounded-lg bg-black-50 resize-none"
                readOnly
                value={rewrite}
              />
              <button
                className="absolute top-2 right-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg"
                onClick={() => navigator.clipboard.writeText(rewrite)}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      
    </div>
  );
}
