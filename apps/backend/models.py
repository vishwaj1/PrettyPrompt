# app/models.py  (if you keep models separately)
from pydantic import BaseModel

class CompareRequest(BaseModel):
    original_prompt: str
    rewritten_prompt: str
    task_description: str | None = None   # optional: “Write a tweet…”

class Criterion(BaseModel):
    name: str
    score_original: int
    score_rewrite: int

class CompareResponse(BaseModel):
    answer_original: str
    answer_rewrite: str
    criteria: list[Criterion]
    total_original: int
    total_rewrite: int

class TemplateRequest(BaseModel):
    industry: str
    count: int = 5

class TemplateOut(BaseModel):
    topic:       str
    user_prompt: str
