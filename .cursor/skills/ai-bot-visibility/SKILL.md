---
name: ai-bot-visibility
description: Use when editing ai-bot-visibility. GET /check?url=; reports AI crawler visibility (allowed/blocked/not_specified) from robots.txt and page signals; no bindings.
---

# AI Bot Visibility

- **Route**: `GET /check?url=`
- **Inputs**: `url` (required, http/https).
- **Outputs**: JSON with `url`, `disclaimer`, `crawlers[]`, `summary`. Configuration only; no bindings.
- **Bindings**: None.
