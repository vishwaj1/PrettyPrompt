# data/agents.py
from agno import Agent, World
from groq import Groq
from sqlalchemy import create_engine, Table, Column, String, MetaData, DateTime
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
import json
import os
# — your Groq client for LLM calls —
llm = Groq()

# — your SQLAlchemy setup for Postgres/Prisma-compatible tables —
DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL, echo=True)    
meta   = MetaData()
templates = Table(
    "Template", meta,
    Column("id",          String, primary_key=True),
    Column("industry",    String, nullable=False),
    Column("name",        String, nullable=False),
    Column("description", String, nullable=False),
    Column("prompt",      String, nullable=False),
    Column("createdAt",   DateTime, default=datetime.utcnow)
)
meta.create_all(engine)



class IndustryLister(Agent[None, list[str]]):
    """
    Returns the list of industries you care about.
    Could also fetch them from your own DB or config.
    """
    def run(self, _: None) -> list[str]:
        return [
            "E-commerce", "Healthcare", "Legal", "Finance", "Education",
            # …etc
        ]


class TemplateGenerator(Agent[str, list[dict]]):
    """
    Given one industry, call your LLM once to get 5 JSONified templates.
    """
    def run(self, industry: str) -> list[dict]:
        prompt = f"""
You are an expert prompt engineer. Produce exactly 5 templates for the **{industry}** industry.
Return strict JSON array; each item must have:
- id (snake_case string)
- name (one line)
- description (one sentence)
- prompt (with {{placeholder}} syntax)
"""
        resp = llm.chat.completions.create(
            model="gpt-4o",
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(resp.choices[0].message.content)


class DBWriter(Agent[list[dict], None]):
    """
    Persists each template into Postgres via SQLAlchemy.
    Upserts on id so it’s safe to re-run.
    """
    def run(self, items: list[dict]) -> None:
        with engine.begin() as conn:
            for t in items:
                stmt = insert(templates).values(
                    id          = t["id"],
                    industry    = t["industry"],
                    name        = t["name"],
                    description = t["description"],
                    prompt      = t["prompt"],
                    createdAt   = datetime.utcnow()
                ).on_conflict_do_nothing()
                conn.execute(stmt)

