'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

type Mode   = 'rewrite' | 'shorten' | 'lengthen' | 'casual' | 'formal';
type Target = 'gpt4o' | 'claude' | 'gemini' | 'mistral' | 'llama3';

type PromptHistoryItem = {
  id: string;
  originalPrompt: string;
  rewrittenPrompt: string;
  mode: Mode;
  targetModel: Target;
  createdAt: string;
};

type Criterion = { name: string; score_original: number; score_rewrite: number; };
type CompareResponse = {
  answer_original: string;
  answer_rewrite:  string;
  criteria:        Criterion[];
  total_original:  number;
  total_rewrite:   number;
};

const API = process.env.NEXT_PUBLIC_API_URL;
const MODELS: { id: Target; label: string }[] = [
  { id: 'gpt4o',  label: 'GPT-4o'   },
  { id: 'claude', label: 'Claude 3' },
  { id: 'gemini', label: 'Gemini 1.5' },
  { id: 'mistral',label: 'Mistral 8×22B' },
  { id: 'llama3', label: 'Llama-3 70B' }
];

export default function PrettyPromptPage() {
  const { data: session } = useSession();
  //const userEmail = session?.user?.email ?? 'anonymous';

  const [draft,   setDraft]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const [fewShot, setFewShot] = useState(false);

  const [chosen,  setChosen]  = useState<Record<Target, boolean>>({
    gpt4o:true, claude:false, gemini:false, mistral:false, llama3:false
  });
  const [results, setResults] = useState<Record<Target, string>>({
    gpt4o:'', claude:'', gemini:'', mistral:'', llama3:''
  });

  const [compare, setCompare] = useState<CompareResponse|null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Fetch user history on mount
  useEffect(() => {
    if (!session) return;
    fetch('/api/prompts')
      .then(res => res.json())
      .then((data: PromptHistoryItem[]) => setHistory(data))
      .catch(console.error);
  }, [session]);

  const toggle = (id: Target) => setChosen(p => ({ ...p, [id]: !p[id] }));

  const assist = async (mode: Mode) => {
    if (!draft.trim()) return;
    const active = (Object.keys(chosen) as Target[]).filter(k => chosen[k]);
    if (active.length === 0) {
      alert('Select at least one model');
      return;
    }

    setBusy(true);
    try {
      const pairs = await Promise.all(
        active.map(async targetModel => {
          // 1) Call your FastAPI backend
          const res = await fetch(`${API}/prompt-assist`, {
            method: 'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({
              prompt: draft,
              mode,
              target_model: targetModel,
              synth_examples: fewShot,
              context: history.slice(-3).map(h => h.rewrittenPrompt),
            }),
          });
          if (!res.ok) throw new Error('LLM error');
          const { prompt: rewritten } = await res.json();

          // 2) Persist into your Next.js API
          fetch('/api/prompts', {
            method: 'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({
              original: draft,
              rewritten,
              mode,
              targetModel,
            }),
          }).catch(console.error);

          return [targetModel, rewritten] as const;
        })
      );

      const resultMap = Object.fromEntries(pairs) as Record<Target, string>;
      setResults(resultMap);

      // 3) Prepend the newest to history
      const first = pairs[0];
      const newEntry = {
        id:        'temporary', // will refresh on next full GET
        originalPrompt: draft,
        rewrittenPrompt: first[1],
        mode,
        targetModel: first[0],
        createdAt: new Date().toISOString(),
      };
      setHistory(h => [newEntry, ...h].slice(0, 20));

    } catch (err) {
      console.error(err);
      alert('Backend error – please retry.');
    } finally {
      setBusy(false);
    }
  };

  const runCompare = async () => {
    const firstOut = Object.values(results)[0];
    if (!draft.trim() || !firstOut) return;
    setBusy(true);
    const res = await fetch(`${API}/compare`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        original_prompt:  draft,
        rewritten_prompt: firstOut,
      }),
    });
    setCompare(await res.json());
    setBusy(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-5 shadow-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-blue-100 dark:border-zinc-800 sticky top-0 z-20">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-emerald-400 tracking-tight">
          PrettyPrompt
        </h1>
        {session ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow hover:from-blue-700 hover:to-emerald-600 transition"
          >
            Sign&nbsp;out&nbsp;({session.user?.email})
          </button>
        ) : (
          <div className="flex gap-3">
            <a
              href='/login'
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              Sign&nbsp;in
            </a>
            <a
              href="/register"
              className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 font-semibold shadow hover:bg-emerald-200 transition"
            >
              Sign&nbsp;up
            </a>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl p-6 space-y-8">
        {/* Description */}
        <div className="mb-2 mt-4 text-center">
          <p className="text-lg text-gray-700 dark:text-zinc-300">
            Craft clearer, model-ready prompts & benchmark them instantly.
          </p>
        </div>

        {/* Prompt textarea */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-lg p-6 border border-blue-100 dark:border-zinc-800">
          <textarea
            className="w-full h-36 p-4 border-2 border-blue-200 dark:border-zinc-700 rounded-xl bg-blue-50 dark:bg-zinc-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            placeholder="Paste or type your prompt…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />

          {/* Model checkboxes */}
          <fieldset className="flex flex-wrap gap-4 mt-4">
            {MODELS.map(m => (
              <label key={m.id} className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4"
                  checked={chosen[m.id]}
                  onChange={() => toggle(m.id)}
                />
                <span className="text-gray-700 dark:text-zinc-200">{m.label}</span>
              </label>
            ))}
          </fieldset>

          {/* Few-shot toggle */}
          <label className="flex items-center gap-2 text-sm mt-4">
            <input
              type="checkbox"
              className="accent-emerald-600 w-4 h-4"
              checked={fewShot}
              onChange={() => setFewShot(p => !p)}
            />
            <span className="text-emerald-700 dark:text-emerald-300">Auto few-shot example</span>
          </label>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {(['rewrite', 'shorten', 'lengthen', 'casual', 'formal'] as Mode[]).map(m => (
              <button
                key={m}
                disabled={busy || !draft.trim()}
                onClick={() => assist(m)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-semibold shadow disabled:from-blue-200 disabled:to-emerald-100 disabled:text-gray-400 transition"
              >
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
            <button
              className="px-4 py-2 rounded-lg border-2 border-blue-400 text-blue-700 font-semibold bg-white shadow hover:bg-blue-50 transition disabled:border-blue-100 disabled:text-blue-300"
              disabled={busy || !draft.trim() || Object.keys(results).length === 0}
              onClick={runCompare}
            >
              Benchmark
            </button>
          </div>
        </div>

        {/* Result cards */}
        {Object.keys(results).length > 0 && (
          <section className="grid md:grid-cols-2 gap-6 mt-8">
            {(Object.keys(results) as Target[]).map(id => (
              <div key={id} className="border rounded-2xl p-6 bg-white/90 dark:bg-zinc-900/90 shadow-lg">
                <h3 className="font-semibold mb-2 text-center text-blue-700 dark:text-emerald-400 text-lg">{MODELS.find(m => m.id === id)?.label}</h3>
                <pre className="whitespace-pre-wrap text-base leading-6 text-gray-800 dark:text-zinc-100">{results[id]}</pre>
              </div>
            ))}
          </section>
        )}

        {/* Benchmark card */}
        {compare && (
          <section className="mt-8 space-y-6">
            <div className="rounded-2xl border shadow-lg p-8 bg-white/90 dark:bg-zinc-900/90">
              <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-emerald-400">Quality benchmark</h2>
              <ul className="space-y-5">
                {compare.criteria?.length ? (
                  compare.criteria.map(c => {
                    const max = 10;
                    const pctOrig = (c.score_original / max) * 100;
                    const pctRewr = (c.score_rewrite / max) * 100;
                    return (
                      <li key={c.name} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          <span className="capitalize">{c.name}</span>
                        </div>
                        <div className="relative h-4 rounded bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-400/70 z-10" />
                          <div className="absolute left-0 top-0 h-full bg-red-500/70" style={{ width: `${pctOrig}%` }} />
                          <div className="absolute right-0 top-0 h-full bg-emerald-500" style={{ width: `${pctRewr}%` }} />
                          <span className="absolute left-1 text-[11px] top-1/2 -translate-y-1/2 text-red-900 dark:text-red-200 z-20">
                            {c.score_original}
                          </span>
                          <span className="absolute right-1 text-[11px] top-1/2 -translate-y-1/2 text-emerald-900 dark:text-emerald-200 z-20">
                            {c.score_rewrite}
                          </span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-center text-sm text-zinc-500">No scores yet</li>
                )}
              </ul>
              <div className="mt-8 flex justify-between">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Overall</span>
                <span className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-red-600">{compare.total_original}</span>
                  <span className="text-xs text-zinc-500">→</span>
                  <span className="text-emerald-600">{compare.total_rewrite}</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Prompt history */}
        {/* Prompt history */}
      {session && history.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Prompt History ({history.length})
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {history.map(item => (
              <div
                key={item.id}
                className="p-4 bg-white/90 dark:bg-zinc-800 rounded-lg border"
              >
                <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 mb-1">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <span className="capitalize">
                    {item.mode} / {item.targetModel}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-zinc-100">
                  {item.rewrittenPrompt}
                </pre>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded"
                    onClick={() => navigator.clipboard.writeText(item.rewrittenPrompt)}
                  >
                    Copy
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 rounded"
                    onClick={() => {
                      setDraft(item.originalPrompt);
                      setResults({ ...results, [item.targetModel]: item.rewrittenPrompt });
                    }}
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      </main>
    </div>
  );
}








