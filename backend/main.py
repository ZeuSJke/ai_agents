"""
AI Agents — FastAPI backend для общения с LLM через OpenRouter.
"""

import os
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel, Field

from pathlib import Path

# Загружаем .env из корня проекта (на уровень выше backend/)
_root_env = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_root_env)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "minimax/minimax-m2.5")
BASE_URL = "https://openrouter.ai/api/v1"

app = FastAPI(title="AI Agents API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_client() -> OpenAI:
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY не задан. Создайте файл .env по образцу .env.example",
        )
    return OpenAI(base_url=BASE_URL, api_key=OPENROUTER_API_KEY)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message] = Field(default_factory=list)
    system_prompt: str = ""
    assistant_prompt: str = ""
    model: str = DEFAULT_MODEL
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    max_tokens: Optional[int] = None
    seed: Optional[int] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None
    stream: bool = True


@app.post("/api/chat")
async def chat(req: ChatRequest):
    client = get_client()

    # Собираем сообщения: system → history → assistant prefill
    api_messages: list[dict] = []

    if req.system_prompt.strip():
        api_messages.append({"role": "system", "content": req.system_prompt.strip()})

    for msg in req.messages:
        api_messages.append({"role": msg.role, "content": msg.content})

    if req.assistant_prompt.strip():
        api_messages.append({"role": "assistant", "content": req.assistant_prompt.strip()})

    # Параметры генерации (передаём только заданные)
    kwargs: dict = {
        "model": req.model,
        "messages": api_messages,
    }

    if req.temperature is not None:
        kwargs["temperature"] = req.temperature
    if req.top_p is not None:
        kwargs["top_p"] = req.top_p
    if req.max_tokens is not None:
        kwargs["max_tokens"] = req.max_tokens
    if req.seed is not None:
        kwargs["seed"] = req.seed
    if req.frequency_penalty is not None:
        kwargs["frequency_penalty"] = req.frequency_penalty
    if req.presence_penalty is not None:
        kwargs["presence_penalty"] = req.presence_penalty

    # top_k передаём через extra_body, т.к. OpenAI SDK его не поддерживает напрямую
    extra_body: dict = {}
    if req.top_k is not None:
        extra_body["top_k"] = req.top_k
    if extra_body:
        kwargs["extra_body"] = extra_body

    if req.stream:
        kwargs["stream"] = True
        kwargs["stream_options"] = {"include_usage": True}

        def generate():
            try:
                stream = client.chat.completions.create(**kwargs)
                generation_id = None
                usage = None
                for chunk in stream:
                    # Capture generation id from first chunk
                    if generation_id is None and hasattr(chunk, "id") and chunk.id:
                        generation_id = chunk.id

                    # Capture usage from final chunk (choices may be empty)
                    if hasattr(chunk, "usage") and chunk.usage:
                        usage = {
                            "prompt_tokens": chunk.usage.prompt_tokens,
                            "completion_tokens": chunk.usage.completion_tokens,
                            "total_tokens": chunk.usage.total_tokens,
                        }

                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and delta.content:
                        data = json.dumps({"content": delta.content}, ensure_ascii=False)
                        yield f"data: {data}\n\n"

                # Send metadata before DONE
                meta: dict = {}
                if usage:
                    meta["usage"] = usage
                if generation_id:
                    meta["generation_id"] = generation_id
                if meta:
                    yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

                yield "data: [DONE]\n\n"
            except Exception as e:
                error = json.dumps({"error": str(e)}, ensure_ascii=False)
                yield f"data: {error}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
    else:
        try:
            response = client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            result: dict = {"content": content}
            if hasattr(response, "usage") and response.usage:
                result["usage"] = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
            if hasattr(response, "id") and response.id:
                result["generation_id"] = response.id
            return result
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))


@app.get("/api/generation/{generation_id}")
async def get_generation(generation_id: str):
    """Fetch generation stats (cost, tokens) from OpenRouter."""
    import httpx

    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY не задан")

    async with httpx.AsyncClient() as http:
        resp = await http.get(
            f"{BASE_URL}/generation?id={generation_id}",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="OpenRouter generation API error")
    return resp.json()


@app.get("/api/health")
async def health():
    return {"status": "ok"}
