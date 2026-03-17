"""
AI Agents — CLI-версия чата с LLM через OpenRouter (устаревшая).

Актуальная версия: backend/ (FastAPI) + frontend/ (Next.js).
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.text import Text

load_dotenv()

console = Console()

# ─── Конфигурация ───────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "minimax/minimax-m2.5")
BASE_URL = "https://openrouter.ai/api/v1"

SYSTEM_PROMPT = (
    "Ты — полезный AI-ассистент. Отвечай кратко и по делу. "
    "Поддерживай контекст беседы."
)


def create_client() -> OpenAI:
    """Создать клиент OpenAI, направленный на OpenRouter."""
    if not OPENROUTER_API_KEY:
        console.print(
            "[bold red]Ошибка:[/] переменная окружения OPENROUTER_API_KEY не задана.\n"
            "Создайте файл .env по образцу .env.example"
        )
        sys.exit(1)

    return OpenAI(
        base_url=BASE_URL,
        api_key=OPENROUTER_API_KEY,
    )


def chat(client: OpenAI, messages: list[dict]) -> str:
    """Отправить сообщения в LLM и вернуть ответ."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
    )
    return response.choices[0].message.content


def print_banner() -> None:
    """Вывести приветственный баннер."""
    banner = Text.assemble(
        ("🤖 AI Agents", "bold bright_cyan"),
        (" — ", "dim"),
        ("CLI для общения с LLM через OpenRouter", "italic bright_white"),
    )
    console.print(Panel(banner, border_style="bright_cyan", padding=(1, 2)))
    console.print(
        f"  [dim]Модель:[/] [bold]{MODEL}[/]\n"
        f"  [dim]Команды:[/] [bold yellow]exit[/] / [bold yellow]quit[/] — выход  •  "
        f"[bold yellow]clear[/] — очистить историю\n"
    )


def main() -> None:
    """Основной цикл приложения."""
    print_banner()

    client = create_client()
    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    while True:
        try:
            user_input = console.input("[bold green]Вы ▶ [/] ").strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]До свидания![/]")
            break

        if not user_input:
            continue

        if user_input.lower() in ("exit", "quit"):
            console.print("[dim]До свидания![/]")
            break

        if user_input.lower() == "clear":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            console.print("[dim italic]История очищена.[/]\n")
            continue

        messages.append({"role": "user", "content": user_input})

        with console.status("[bold cyan]Думаю…[/]", spinner="dots"):
            try:
                answer = chat(client, messages)
            except Exception as e:
                console.print(f"[bold red]Ошибка API:[/] {e}\n")
                messages.pop()  # убрать неотправленное сообщение
                continue

        messages.append({"role": "assistant", "content": answer})

        console.print()
        console.print(Panel(Markdown(answer), title="AI", border_style="bright_cyan"))
        console.print()


if __name__ == "__main__":
    main()
