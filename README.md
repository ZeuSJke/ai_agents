# 🤖 AI Agents

CLI-приложение для общения с LLM через [OpenRouter](https://openrouter.ai/).

## Быстрый старт

```bash
# 1. Установить зависимости
pip install -r requirements.txt

# 2. Создать .env файл с ключом
cp .env.example .env
# Откройте .env и вставьте свой ключ OpenRouter

# 3. Запустить
python main.py
```

## Команды

| Команда         | Описание                 |
|-----------------|--------------------------|
| `exit` / `quit` | Выход из приложения      |
| `clear`         | Очистить историю беседы  |

## Настройка модели

По умолчанию используется `minimax/minimax-m2.5`. Можно изменить через переменную окружения:

```env
OPENROUTER_MODEL=minimax/minimax-m2.5
```