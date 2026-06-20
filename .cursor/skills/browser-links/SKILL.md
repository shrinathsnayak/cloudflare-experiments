---
name: browser-links
description: Use when editing browser-links. GET /links?url=; Browser Rendering link extraction.
---

# Browser Links

- **Route**: `GET /links?url=<url>`
- **Response**: `{ url, linkCount, truncated, links }`
- **Bindings**: BROWSER. Uses `@cloudflare/puppeteer`; `nodejs_compat_v2`.
