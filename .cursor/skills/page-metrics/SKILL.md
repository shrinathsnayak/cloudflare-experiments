---
name: page-metrics
description: Use when editing page-metrics. GET /metrics?url=; Browser Rendering page.metrics().
---

# Page Metrics

- **Route**: `GET /metrics?url=<url>`
- **Response**: `{ url, metrics }` from Puppeteer `page.metrics()`
- **Bindings**: BROWSER. Uses `@cloudflare/puppeteer`; `nodejs_compat_v2`.
