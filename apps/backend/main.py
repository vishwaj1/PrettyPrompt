import os

# ─── Remove any proxy env vars so Groq() won't inherit them ───
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
import groq
from fastapi import HTTPException
import time


load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")
client = Groq(api_key=api_key)
MODEL = os.getenv("MODEL", "llama2-70b-4096")

app = FastAPI(title="Promptly Analyzer", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://prettyprompt.vercel.app/*","localhost:3000/*"],  # or ["*"] during dev
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
You are PrettyPrompt, the world’s leading prompt‐engineering assistant.  
When given a user’s raw prompt, produce a single, final rewritten prompt that is:  
• Clear and unambiguous  
• Structured for optimal LLM performance (use headings, numbered steps, bullets where helpful)  
• True to the user’s original intent, tone, and constraints  

Return **only** the rewritten prompt text—no explanations, no examples, no markdown fences, no extra whitespace."""

class AssistResponse(BaseModel):
    prompt: str
MODE_INSTRUCTIONS = {
    "rewrite":  "Rewrite the prompt to be maximally clear, specific, and well-structured for an advanced LLM.",
    "shorten":  "Condense the prompt to its essential elements without losing meaning or required details. Reduce the length of the prompt than the original prompt",
    "lengthen": "Expand the prompt with concrete details, examples, or clarifications to ensure completeness.",
    "casual":   "Rephrase the prompt in a relaxed, conversational tone while preserving all constraints.",
    "formal":   "Rephrase the prompt in a professional, formal style, using full sentences and precise vocabulary."
}

GUIDES = {
    "gpt4o": (
        "• Use a single SYSTEM message summarizing the overall objective.\n"
        "• Include a brief context line if needed.\n"
        "• Present the main actions as a numbered list and constraints as bullet points.\n"
        "• Avoid any “User:” or “Assistant:” labels.\n"
        "• Keep the total prompt under 1500 tokens.\n"
        "• Do not add examples unless explicitly requested."
    ),
    "claude": (
        "• Start with “Assistant:” followed immediately by the rewritten prompt.\n"
        "• Use ### headings to separate sections, e.g.:\n"
        "  ### Prompt\n"
        "  ### Constraints\n"
        "  ### Context\n"
        "• Never wrap in code fences or markdown blocks.\n"
        "• Maintain a warm, explanatory tone.\n"
        "• Return only the final prompt text—no closing remarks."
    ),
    "gemini": (
        "• Omit SYSTEM messages; output the prompt directly.\n"
        "• Use “### Instruction:” for the task and “### Context:” for background.\n"
        "• Add a “### Constraints:” section with each constraint as a bullet.\n"
        "• Keep language concise and directive.\n"
        "• Do not include any meta-commentary or salutations."
    ),
    "mistral": (
        "• Use one clear SYSTEM message to frame the rewrite goal.\n"
        "• Structure the prompt in three sections:\n"
        "  1) Task Description\n"
        "  2) Detailed Instructions (numbered)\n"
        "  3) Constraints List (bullets)\n"
        "• Ensure total length ≤1500 tokens.\n"
        "• Do not insert examples or extra narrative."
    ),
    "llama3": (
        "• Begin with a SYSTEM message stating the purpose.\n"
        "• Follow with a USER message formatted as:\n"
        "  1) Task Description\n"
        "  2) Supporting Details\n"
        "  3) Constraints\n"
        "• Use precise, concise language.\n"
        "• Keep the prompt under 1500 tokens.\n"
        "• Avoid redundant or vague phrasing."
    )
}


def build_prompt(base: str, req: AssistRequest) -> str:
    instruction = MODE_INSTRUCTIONS[req.mode]
    guide       = GUIDES[req.target_model]

    prompt = f"""{instruction} the original prompt to be maximally clear, specific, and well-structured for an advanced LLM.

    ### Target model rules
    {guide}

    ### Original prompt
    {base}

    ### Rewritten prompt
    """
    if req.context:
        prompt += "\n\n--- Conversation context ---\n" + "\n".join(req.context[-3:])
    return prompt

def call_groq_with_retry(model: str, temperature: float, messages: list[dict]):
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            return client.chat.completions.create(
                model=model,
                temperature=temperature,
                messages=messages
            )
        except groq.InternalServerError as e:
            # if it's the last attempt, re-raise so our outer code can handle it
            if attempt == max_attempts:
                raise
            # otherwise wait (2^attempt seconds) then retry
            time.sleep(2 ** attempt)

def assist(req: AssistRequest) -> AssistResponse:
    base_prompt = req.prompt
    if req.synth_examples:
        # generate example with retry
        try:
            fewshot_resp = call_groq_with_retry(
                model=MODEL,
                temperature=0.5,
                messages=[
                    {"role":"system","content":"Generate ONE realistic input→output pair illustrating the prompt below."},
                    {"role":"user","content": req.prompt}
                ]
            )
            fewshot = fewshot_resp.choices[0].message.content.strip()
            base_prompt = f"{req.prompt}\n\n### Example\n{fewshot}"
        except groq.InternalServerError:
            # give up on examples, but continue without them
            base_prompt = req.prompt

    messages = [
        {"role":"system","content": PROMPT_ASSIST},
        {"role":"user",  "content": build_prompt(base_prompt, req)}
    ]
    if req.context:
        ctx = "\n\n--- Conversation context ---\n" + "\n".join(req.context[-3:])
        messages[1]["content"] += ctx

    try:
        resp = call_groq_with_retry(
            model=MODEL,
            temperature=0.3,
            messages=messages
        )
    except groq.InternalServerError:
        # translate to HTTP 503
        raise HTTPException(
            status_code=503,
            detail="Upstream model service is unavailable; please try again shortly."
        )

    text = resp.choices[0].message.content.strip()
    return AssistResponse(prompt=text)

@app.post("/prompt-assist", response_model=AssistResponse)
def assist_endpoint(body: AssistRequest):
    return assist(body)


GRADE_SYSTEM = """\
You are an unbiased evaluator. You'll receive:
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