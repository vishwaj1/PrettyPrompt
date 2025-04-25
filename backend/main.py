from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from fastapi.middleware.cors  import CORSMiddleware

import os
import re,json
load_dotenv()
client = Groq()
MODEL = os.getenv("MODEL", "meta-llama/llama-4-maverick-17b-128e-instruct")

app = FastAPI(title="Promptly Analyzer", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] during dev
    allow_credentials=True,
    allow_methods=["*"],      # <-- include OPTIONS automatically
    allow_headers=["*"],      # allow Content-Type, Authorization, etc.
)

# ---------- Pydantic Schemas ----------

class PromptRequest(BaseModel):
    prompt: str

class PromptAnalysis(BaseModel):
    intent: str
    constraints: list[str] | None
    desired_format: str | None
    tone: str | None
    gaps: list[str] | None

# ---------- Helper that calls OpenAI ----------

SYSTEM_MESSAGE = """\
You are PrettyPrompt, an expert prompt-analysis agent.
For any prompt you receive, identify:
1. The main *intent* (short sentence).
2. Any *explicit constraints* (bullet phrases).
3. The *desired output format* if mentioned (e.g. “JSON”, “list”, “essay”, or “unspecified”).
4. The author’s *tone/style* (one word: “formal”, “casual”, “technical”, etc., or “unspecified”).
5. Up to 3 major *gaps* or ambiguities that might trip up an LLM (empty list if none).

Return ONLY valid JSON exactly in this schema:
{
  "intent": "...",
  "constraints": ["...", ...] | [],
  "desired_format": "...",
  "tone": "...",
  "gaps": ["...", ...] | []
}
"""

def analyze_prompt(raw_prompt: str) -> PromptAnalysis:
    completion = client.chat.completions.create(
        model=MODEL,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user",   "content": raw_prompt}
        ]
    )
    payload = completion.choices[0].message.content

    # NEW — strip ``` fences if they exist
    if payload.lstrip().startswith("```"):
        payload = re.sub(r"^```(\w+)?\s*|```$", "", payload.strip(), flags=re.DOTALL).strip()

    try:
        return PromptAnalysis.model_validate_json(payload)
    except Exception as e:
        raise ValueError(f"LLM returned invalid JSON: {e}\nRaw:\n{payload}")
# ---------- API Route ----------

@app.post("/analyze-prompt", response_model=PromptAnalysis)
def analyze_endpoint(body: PromptRequest):
    try:
        return analyze_prompt(body.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



#---------- Suggest prompt----------
class ImprovementSuggestions(BaseModel):
    items: list[str]          # bullet-style tips

SUGGESTION_SYSTEM = """\
    You are Promptly, a prompt-improvement coach.

    When given a raw prompt, produce 3-6 concise bullet suggestions that would
    * measurably improve* the prompt.  Focus on:
    • Clarity & specificity
    • Tone / audience match
    • Output-format hints
    • Edge-case coverage
    Return ONLY a JSON array of strings.  Do NOT wrap it in back-ticks.
    """
def suggest_improvements(raw_prompt: str) -> ImprovementSuggestions:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0.3,
        messages=[
            {"role": "system", "content": SUGGESTION_SYSTEM},
            {"role": "user", "content": raw_prompt},
        ],
    )
    payload = response.choices[0].message.content
    # strip ``` fences if the model still adds them
    if payload.lstrip().startswith("```"):
        payload = re.sub(r"^```(\w+)?\s*|```$", "", payload.strip(), flags=re.DOTALL).strip()
    return ImprovementSuggestions(items=json.loads(payload))


@app.post("/suggest-improvements", response_model=ImprovementSuggestions)
def suggest_endpoint(body: PromptRequest):
    try:
        return suggest_improvements(body.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

#---------- Rewrite prompt----------

class RewrittenPrompt(BaseModel):
    prompt: str
REWRITE_SYSTEM = """\
You are PrettyPrompt, a prompt-rewriting assistant.

Rewrite the user’s prompt so it is clearer, more specific, and follows best
practice for large-language-model queries.  Preserve the user’s intent,
tone, and any critical constraints, but improve structure, add formatting
hints, and include examples if obviously beneficial.

Return the *entire rewritten prompt* as raw text — **do not** wrap it in
Markdown fences or JSON.
"""
def rewrite_prompt(raw_prompt: str) -> RewrittenPrompt:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0.3,
        messages=[
            {"role": "system", "content": REWRITE_SYSTEM},
            {"role": "user", "content": raw_prompt},
        ],
    )
    rewritten = response.choices[0].message.content.strip()
    # strip ``` fences if the model ignored instructions
    if rewritten.startswith("```"):
        rewritten = re.sub(r"^```.*?\n|\n```$", "", rewritten, flags=re.DOTALL).strip()
    return RewrittenPrompt(prompt=rewritten)


@app.post("/rewrite-prompt", response_model=RewrittenPrompt)
def rewrite_endpoint(body: PromptRequest):
    try:
        return rewrite_prompt(body.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




