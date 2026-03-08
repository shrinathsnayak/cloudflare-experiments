---
name: is-it-down
description: Use when editing or extending the is-it-down experiment. Route GET /check?url=; returns reachability and response time; no bindings; stateless fetch.
---

# Is It Down

- **Route**: `GET /check?url=`
- **Inputs**: `url` (required, http/https).
- **Outputs**: JSON with `status`, `responseTime`, `statusCode`, optional `error`.
- **Bindings**: None. Keep stateless.
