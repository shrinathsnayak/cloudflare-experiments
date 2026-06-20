---
name: durable-counter
description: Use when editing durable-counter. GET/POST /counter; Durable Objects Counter class; persistent edge state.
---

# Durable Counter

- **Routes**: `GET /counter`, `POST /counter/increment`, `POST /counter/reset`
- **Response**: `{ value: number }`
- **Bindings**: Durable Object namespace `COUNTER` → class `Counter`
- **Pattern**: Single named DO (`global`) for globally consistent state
