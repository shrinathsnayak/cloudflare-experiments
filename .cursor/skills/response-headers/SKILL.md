---
name: response-headers
description: Use when editing response-headers. GET /headers?url=; inspect HTTP response headers.
---

# Response Headers

- **Route**: `GET /headers?url=<url>`
- **Response**: `{ url, statusCode, statusText, method, headers }`
- **Bindings**: None. Uses Fetch API (HEAD with GET fallback).
