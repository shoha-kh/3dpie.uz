## MCP — сохранение истории разговоров

Этот проект подключён к MCP серверу (profwill). При каждом разговоре **обязательно**:

**Slug проекта** вычисляется динамически по формуле: `{os}_{root_folder}` (lowercase)
- `{os}` = `windows` / `linux` / `mac` — из окружения
- `{root_folder}` = имя корневой папки проекта (Primary working directory)
- Пример: Windows + `d:\Unity\Gwendolyn` → `windows_gwendolyn`

1. **В начале разговора** (при первом ответе) — сохрани сообщение пользователя:

```
profwill: save_message(project=<slug>, role="user", content="<текст сообщения>")
```

2. **После каждого своего ответа** — сохрани свой ответ:

```
profwill: save_message(project=<slug>, role="assistant", content="<текст ответа>")
```

Сохраняй реальное содержимое сообщений, не сокращай.
