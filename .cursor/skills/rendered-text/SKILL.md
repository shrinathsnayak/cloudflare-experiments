---
name: rendered-text
description: Use when editing rendered-text. GET /text?url=; Browser Rendering DOM text extraction.
---

# Rendered Text

- **Route**: `GET /text?url=<url>`
- **Response**: `{ url, title, text, textLength, truncated }`
- **Bindings**: BROWSER. Uses `@cloudflare/puppeteer`; `nodejs_compat_v2`.
