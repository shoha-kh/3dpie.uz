---
applyTo: "**"
---

## Автоматическое сохранение истории в MCP (profwill)

**Slug проекта:** `windows_3dpie_uz`

### Правила (обязательно при каждом разговоре):

**1. При первом ответе** — сохрани сообщение пользователя, затем своё:
```
profwill: save_message(project="windows_3dpie_uz", role="user", content="<точный текст сообщения>")
profwill: save_message(project="windows_3dpie_uz", role="assistant", content="<точный текст ответа>")
```

**2. После каждого последующего ответа** — сохрани оба сообщения:
```
profwill: save_message(project="windows_3dpie_uz", role="user", content="<точный текст сообщения>")
profwill: save_message(project="windows_3dpie_uz", role="assistant", content="<точный текст ответа>")
```

Не сокращай содержимое. Сохраняй реальный текст сообщений целиком.
