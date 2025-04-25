'use client';

import { useState } from 'react';

type Analysis = {
  intent: string;
  constraints: string[] | null;
  desired_format: string | null;
  tone: string | null;
  gaps: string[] | null;
};

export default function PromptlyPage() {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error((await res.json()).detail ?? res.statusText);
      const data: Analysis = await res.json();
      setAnalysis(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">PrettyPrompt</h1>

      <textarea
        className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring"
        placeholder="Paste your prompt here…"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <button
        className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
        disabled={loading || !prompt.trim()}
        onClick={handleAnalyze}
      >
        {loading ? 'Analyzing…' : 'Analyze'}
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* Analysis output */}
      {analysis && (
        <pre className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{JSON.stringify(analysis, null, 2)}
        </pre>
      )}
    </div>
  );
}
