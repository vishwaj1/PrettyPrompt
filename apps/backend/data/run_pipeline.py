import json
from agno.agent       import Agent, RunResponse
from agno.models.groq import Groq
from dotenv import load_dotenv
import requests

load_dotenv()

# ─── 1) Spin up your three agents ───
topic_agent = Agent(
    name     = "TopicGenerator",
    model    = Groq(id="llama-3.3-70b-versatile"),
    markdown = False,
)
meta_agent = Agent(
    name     = "MetaPromptCreator",
    model    = Groq(id="llama-3.3-70b-versatile"),
    markdown = False,
)
final_agent = Agent(
    name     = "PromptProducer",
    model    = Groq(id="llama-3.3-70b-versatile"),
    markdown = False,
)


# ─── 2) Stage #1: Get topics ───
def gen_topics(industry: str, count: int = 10) -> list[str]:
    prompt = (
        f"You are an expert in prompt engineering.  List {count} distinct topic areas "
        f"for creating prompt templates in the **{industry}** industry.  "
        "Return ONLY a JSON array of strings."
    )
    resp: RunResponse = topic_agent.run(prompt)
    return json.loads(resp.content)


# ─── 3) Stage #2: Build meta-prompts ───
def make_meta(industry: str, topics: list[str]) -> list[dict]:
    metas = []
    for topic in topics:
        p = (
            f"You are a senior prompt engineer. Return a JSON object in this EXACT format:\n"
            "{\n"
            f'  \"topic\": \"{topic}\",\n'
            '  \"meta_prompt\": \"Your detailed LLM prompt here\"\n'
            "}\n\n"
            "Given the topic and **{industry}** above, generate a single user-facing prompt that can be sent straight into an LLM. "
            "Your `meta_prompt` must:\n"
            "• Begin with a clear role declaration (e.g., “System:” or a system message block).\n"
            "• Specify the task in plain terms.\n"
            "• Be structured into sections as needed (Task / Context / References / Evaluate / Iterate).\n"
            "• Follow standard LLM prompting conventions (short sentences, explicit instructions).\n"
            "Return ONLY the JSON object—no extra text, no markdown fences."
        )
        raw = meta_agent.run(p)
        print(f"\nDebug - Raw response for topic '{topic}':")
        print(raw.content)
        try:
            response = json.loads(raw.content)
            if not isinstance(response, dict) or "topic" not in response or "meta_prompt" not in response:
                raise ValueError("Response missing required fields")
            metas.append(response)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error processing topic '{topic}':")
            print("Error:", str(e))
            raise
    return metas


# ─── 4) Stage #3: Generate final user prompts ───
def generate_final(metas: list[dict]) -> list[dict]:
    finals = []
    for m in metas:
        resp: RunResponse = final_agent.run(m["meta_prompt"]+"Use the meta prompt provided to generate a user prompt. Return the user prompt only, no other text.")
        finals.append({
            "topic":       m["topic"],
            "user_prompt": resp.content.strip()
        })
    return finals


# ─── 5) Wire it all together ───
if __name__ == "__main__":
    industry = "Instagram Story Ideas"
    topics = gen_topics(industry)
    print("Topics →", topics)

    metas = make_meta(industry, topics)
    print("Metas →", json.dumps(metas, indent=2))

    finals = generate_final(metas)
    print("Final Prompts →", json.dumps(finals, indent=2))

    # Save to database
    API_URL = "http://localhost:3000/api/templates"

    for entry in finals:
        payload = {
            "industry": industry,
            "topic":      entry["topic"],
            "prompt":     entry["user_prompt"],
        }
        r = requests.post(API_URL, json=payload)
        if not r.ok:
            print("Failed to save:", payload, r.text)
        else:
            print("Saved template:", r.json()["id"])
