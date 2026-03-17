# AI Agents

Веб-приложение для общения с LLM через [OpenRouter](https://openrouter.ai/).

**Стек:** FastAPI (backend) + Next.js (frontend) + Material You 3

## Быстрый старт (Docker)

```bash
# 1. Создать .env файл с ключом
cp .env.example .env
# Откройте .env и вставьте свой ключ OpenRouter

# 2. Запустить
docker compose up --build
```

Откройте http://localhost:3000

## Запуск без Docker

### Backend

```bash
cp .env.example .env
# Вставьте ключ в .env
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Возможности

- Чат с LLM через OpenRouter с поддержкой streaming
- Раздельные промпты: System Prompt, Assistant Prompt (prefill), User Prompt
- Управление параметрами генерации:
  - Temperature, Top P, Top K
  - Max Tokens, Seed
  - Frequency Penalty, Presence Penalty
- Выбор модели (любая модель с OpenRouter)
- Material You 3 дизайн с поддержкой тёмной темы
