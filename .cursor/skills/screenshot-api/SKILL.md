---
name: screenshot-api
description: Use when editing screenshot-api. GET /screenshot?url=; Browser Rendering binding; returns PNG.
---

# Screenshot API

- **Route**: `GET /screenshot?url=`. Response: image/png.
- **Bindings**: BROWSER (Cloudflare Browser Rendering). Use puppeteer.launch(env.BROWSER).
