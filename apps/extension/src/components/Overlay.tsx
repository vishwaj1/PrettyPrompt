export default function Overlay({ tips, onInsert }: {
    tips: string[];
    onInsert: (text: string) => void;
  }) {
    return (
      <div className="fixed top-4 right-4 w-64 rounded-xl bg-white/90 shadow-xl p-4 z-[9999]">
        <h3 className="font-semibold mb-2">PrettyPrompt ideas</h3>
        <ul className="space-y-1">
          {tips.map((t) => (
            <li key={t}>
              <button
                className="text-sm text-blue-700 hover:underline"
                onClick={() => onInsert(t)}
              >
                • {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  