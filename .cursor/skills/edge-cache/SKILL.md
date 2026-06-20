---
name: edge-cache
description: Use when editing edge-cache. GET /fetch?url=; Workers Cache API via caches.default.
---

# Edge Cache

- **Route**: `GET /fetch?url=<url>&bypass=1`
- **Response**: `{ url, cacheStatus, statusCode, contentType, bodySize }`
- **Bindings**: None. Uses `caches.default` and Fetch API.
