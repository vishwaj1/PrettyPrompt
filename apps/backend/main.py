import os

# ─── Remove any proxy env vars so Groq() won’t inherit them ───
for v in ("HTTP_PROXY","HTTPS_PROXY","http_proxy","https_proxy"):
    os.environ.pop(v, None)

from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from fastapi.middleware.cors  import CORSMiddleware
from typing import Optional, Literal, List
from models import CompareRequest, CompareResponse, Criterion

import re,json
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")
client = Groq(
    api_key=api_key,
    base_url="https://api.groq.com/v1"  # Explicitly set base URL
)
MODEL = os.getenv("MODEL", "llama2-70b-4096")

app = FastAPI(title="Promptly Analyzer", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://prettyprompt.vercel.app/"],  # or ["*"] during dev
    allow_credentials=True,
    allow_methods=["*"],      # <-- include OPTIONS automatically
    allow_headers=["*"],      # allow Content-Type, Authorization, etc.
)

# ---------- Helper that grabs JSON ----------
def grab_json(obj_str: str) -> str:
    """
    Return the first {...} block found in ``obj_str``.
    Raises ValueError if no JSON object is detected.
    """
    # ① remove ``` fences if they exist
    if obj_str.lstrip().startswith("```"):
        obj_str = re.sub(r"^```(\w+)?\s*|```$", "", obj_str.strip(),
                         flags=re.DOTALL).strip()

    # ② pull the first {...} object (lazy so it stops at the matching })
    match = re.search(r"\{[\s\S]*?\}", obj_str)
    if not match:
        raise ValueError("No JSON object detected in LLM response")
    return match.group(0)

# ---------- Pydantic Schemas ----------

class AssistRequest(BaseModel):
    prompt: str
    mode: Literal["rewrite", "shorten", "lengthen", "casual", "formal"] = "rewrite"
    target_model: Literal["gpt4o", "claude", "gemini", "mistral", "llama3"] = "gpt4o"   # ← NEW
    context: Optional[List[str]] = None
    synth_examples: bool = False          # ← NEW toggle from the UI

PROMPT_ASSIST = """\
You are PrettyPrompt, an expert prompt improver.

Given a user's prompt, rewrite it to be clearer, more specific, and follows best
practice for large-language-model queries.  Preserve the user's intent,
tone, and any critical constraints, but improve structure, add formatting
hints, and include examples if obviously beneficial. Return ONLY the rewritten prompt text. 
Do not add headers, prefaces, or examples—just the final prompt.
"""
class AssistResponse(BaseModel):
    prompt: str
MODE_INSTRUCTIONS = {
    "rewrite":  "Rewrite the prompt to be clearer and more specific.",
    "shorten":  "Shorten the prompt while keeping its meaning.",
    "lengthen": "Expand the prompt with more detail.",
    "casual":   "Rewrite the prompt in a friendly, casual tone.",
    "formal":   "Rewrite the prompt in a formal, professional tone."
}

GUIDES = {
    "gpt4o":  "• Use a single SYSTEM message.\n• Prefer numbered steps.\n• Cap length at 1500 tokens.",
    "claude": "• Begin with 'Assistant:'.\n• End with 'Sure — here you go!'.\n• Use triple-hash ### sections.",
    "gemini": "• Use ### Instruction / ### Context sections.\n• Put constraints in bullet list.\n• Avoid system role.",
    "mistral": "• Use a single SYSTEM message.\n• Prefer numbered steps.\n• Cap length at 1500 tokens.",
    "llama3": "• Use a single SYSTEM message.\n• Prefer numbered steps.\n• Cap length at 1500 tokens."
}

def build_prompt(base: str, req: AssistRequest) -> str:
    instruction = MODE_INSTRUCTIONS[req.mode]
    guide       = GUIDES[req.target_model]

    prompt = f"""{instruction}

    ### Target model rules
    {guide}

    ### Original prompt
    {base}

    ### Rewritten prompt
    """
    if req.context:
        prompt += "\n\n--- Conversation context ---\n" + "\n".join(req.context[-3:])
    return prompt

def assist(req: AssistRequest) -> AssistResponse:

    # synthesize if user toggled it AND none exist
    base_prompt = req.prompt
    if req.synth_examples:
        fewshot = client.chat.completions.create(
            model=MODEL,
            temperature=0.5,
            messages=[
                {"role":"system","content":"Generate ONE realistic input→output pair illustrating the prompt below."},
                {"role":"user","content": req.prompt}
            ]
        ).choices[0].message.content.strip()
        base_prompt = f"{req.prompt}\n\n### Example\n{fewshot}"

    messages = [
        {"role": "system", "content": PROMPT_ASSIST},
        {"role": "user", "content": build_prompt(base_prompt, req)}
    ]
    if req.context:
        ctx = "\n\n--- Conversation context ---\n" + "\n".join(req.context[-3:])
        messages[1]["content"] += ctx

    resp = client.chat.completions.create(
        model=MODEL, temperature=0.3, messages=messages
    )
    text = resp.choices[0].message.content.strip()
    return AssistResponse(prompt=text)

@app.post("/prompt-assist", response_model=AssistResponse)
def assist_endpoint(body: AssistRequest):
    return assist(body)


GRADE_SYSTEM = """\
You are an unbiased evaluator. You’ll receive:
- Task description
- Answer A
- Answer B

For each criterion give an integer 1-5 (higher is better) and return ONLY strict JSON:

{
  "criteria": [
    { "name": "relevance",   "score_a": <int>, "score_b": <int> },
    { "name": "completeness","score_a": <int>, "score_b": <int> },
    { "name": "style",       "score_a": <int>, "score_b": <int> },
    { "name": "conciseness", "score_a": <int>, "score_b": <int> }
  ]
}
No extra text.
"""

router = APIRouter()
def ask_llm(prompt: str) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        temperature=0.3,
        messages=[{"role":"user","content":prompt}]
    )
    return resp.choices[0].message.content.strip()

@app.post("/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    # 1. produce answers A and B
    answer_a = ask_llm(req.original_prompt)
    answer_b = ask_llm(req.rewritten_prompt)

    # 2. grade
    grading_payload = f"""
Task: {req.task_description or 'Use the prompt itself to infer the task.'}

Answer A:
{answer_a}

Answer B:
{answer_b}
"""
    raw = client.chat.completions.create(
        model=MODEL,
        temperature=0.0,
        messages=[
            {"role":"system","content":GRADE_SYSTEM},
            {"role":"user","content":grading_payload}
        ]
    ).choices[0].message.content

    # strip fences if any
    raw = re.sub(r"^```json|```$", "", raw.strip(), flags=re.DOTALL).strip()
    data = json.loads(raw)

    # 3. build response
    criteria = [
        Criterion(
            name=c["name"],
            score_original=c["score_a"],
            score_rewrite=c["score_b"]
        ) for c in data["criteria"]
    ]
    tx = sum(c.score_original for c in criteria)
    ty = sum(c.score_rewrite  for c in criteria)

    return CompareResponse(
        answer_original = answer_a,
        answer_rewrite  = answer_b,
        criteria        = criteria,
        total_original  = tx,
        total_rewrite   = ty
    )