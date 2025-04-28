import { useState } from 'react';

export default function Popup() {
  const [msg] = useState('PrettyPrompt is running ✔︎');
  return (
    <div className="p-4 w-56 text-sm">{msg}</div>
  );
}
