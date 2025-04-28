const API = 'http://127.0.0.1:8000'; // your deployed backend

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'ANALYZE') {
    fetch(`${API}/suggest-improvements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: msg.prompt }),
    })
      .then((r) => r.json())
      .then((data) => reply({ type: 'SUGGESTIONS', data: data.items }))
      .catch((e) => console.error(e));

    // keep channel open
    return true;
  }
});
