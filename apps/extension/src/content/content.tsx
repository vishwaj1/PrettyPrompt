/// <reference types="chrome" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import Overlay from '../components/Overlay';

console.log('[PrettyPrompt] content script loaded');

/* ---------- helper to wait for a textarea ---------- */
function waitForTextarea(timeout = 10_000): Promise<HTMLTextAreaElement> {
  return new Promise((resolve, reject) => {
    const ta = document.querySelector('textarea');
    if (ta) return resolve(ta as HTMLTextAreaElement);

    const obs = new MutationObserver(() => {
      const el = document.querySelector('textarea');
      if (el) {
        obs.disconnect();
        resolve(el as HTMLTextAreaElement);
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      obs.disconnect();
      reject('textarea not found within 10 s');
    }, timeout);
  });
}

/* ---------- main ---------- */
(async () => {
  try {
    const textarea = await waitForTextarea();
    console.log('[PrettyPrompt] found textarea');

    /* mount overlay root once */
    const mount = document.createElement('div');
    mount.id = 'pp-root';
    document.body.appendChild(mount);
    const root = createRoot(mount);

    let throttle: number | undefined;
    textarea.addEventListener('input', () => {
      clearTimeout(throttle);
      throttle = window.setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'ANALYZE',
          prompt: textarea.value,
        });
      }, 400); // debounce
    });

    /* listen for suggestions */
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'SUGGESTIONS') {
        console.log('[PrettyPrompt] received suggestions', msg.data);
        root.render(
          <Overlay
            tips={msg.data as string[]}
            onInsert={(txt: string) => {
              textarea.value += `\n${txt}`;
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }}
          />
        );
      }
    });
  } catch (e) {
    console.error('[PrettyPrompt] failed:', e);
  }
})();
