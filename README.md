# PrettyPrompt

**PrettyPrompt** is a lightweight web app that helps you write better prompts for large-language-model chatbots.

1. **Paste any prompt.**  
   You drop your rough idea into the text box.

2. **Instant analysis.**  
   The app quickly tells you what your prompt is trying to do (intent), any constraints you’ve included, the tone you’re writing in (formal, casual, creative, technical, etc.), and points out gaps that might confuse an AI.

3. **Actionable tips.**  
   It suggests clear, bullet-style improvements—things like “specify the desired output format” or “add an example so the model knows what ‘concise’ looks like.”

4. **One-click rewrite.**  
   Hit “Rewrite” and PrettyPrompt delivers a polished version that keeps your original intent but is clearer, more specific, and ready to copy-paste back into ChatGPT, Claude, Gemini, or any other LLM.

Behind the scenes a tiny FastAPI backend (running on Groq’s fast Llama 3 model) does the heavy lifting; a React/Next.js frontend shows the results. That’s it—no sign-ups, no clutter, just a simple tool to turn messy first-draft prompts into crisp, high-quality ones in seconds.