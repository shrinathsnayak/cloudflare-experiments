---
name: cloud-ai-proxy
description: Use when editing cloud-ai-proxy. POST/GET /chat with model + prompt; Workers AI; binding AI.
---

# Cloud AI Proxy

- **Route**: `POST /chat` (body `{ model, prompt?, messages?, max_tokens? }`), `GET /chat?model=&prompt=`
- **Outputs**: `{ response: string }`. Bindings: AI (Workers AI).
