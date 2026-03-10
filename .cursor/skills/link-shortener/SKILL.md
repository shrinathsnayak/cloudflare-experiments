---
name: link-shortener
description: Use when editing link-shortener. POST /shorten with { url }; GET /:code redirects; D1 primary, KV read cache.
---

# Link Shortener

- **Routes**: `POST /shorten` (body `{ url }`), `GET /:code` (redirect).
- **Inputs**: Shorten — JSON `url`; Redirect — path `code`.
- **Outputs**: Shorten returns `{ code, url }`; redirect is 302 or 404.
- **Bindings**: D1, KV (LINKS_CACHE).
