---
name: pdf-api
description: Use when editing pdf-api. GET /pdf?url=; Browser Rendering; returns PDF.
---

# PDF API

- **Route**: `GET /pdf?url=<url>`. Response: `application/pdf`.
- **Bindings**: BROWSER (Cloudflare Browser Rendering). Uses `@cloudflare/puppeteer`; `nodejs_compat_v2`.
- **Flow**: launch browser, newPage, goto, `page.pdf()`, close.
