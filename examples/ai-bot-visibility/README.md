# AI Bot Visibility Checker

Check whether a URL is **configured** to be visible or blocked for known AI crawlers (e.g. GPTBot, ClaudeBot, PerplexityBot). Uses `robots.txt` and page-level signals (meta robots, `X-Robots-Tag`) to report which AI platforms the site allows or blocks.

**Disclaimer:** This tool reports **configuration only**. It does not verify whether the URL is actually indexed or used by any AI product; there are no public APIs for that.

## Features

- **GET /check?url=** — Returns per-crawler status (allowed, blocked, not_specified) and a summary by platform.
- No bindings; stateless fetch of the page and `robots.txt`.
- Runs on the edge in under 60 seconds.

## API

### `GET /check`

| Query | Required | Description                |
| ----- | -------- | -------------------------- |
| `url` | Yes      | Target URL (http or https) |

**Example**

```http
GET /check?url=https://www.cloudflare.com
```

**Response**

```json
{
  "url": "https://www.cloudflare.com",
  "disclaimer": "Configuration only; we cannot verify actual index inclusion in any AI product.",
  "crawlers": [
    { "id": "GPTBot", "platform": "ChatGPT", "status": "allowed" },
    { "id": "ClaudeBot", "platform": "Claude", "status": "not_specified" }
  ],
  "summary": {
    "allowed": ["ChatGPT"],
    "blocked": [],
    "notSpecified": ["Claude", "Perplexity", "Google (Gemini/Bard)", "..."]
  }
}
```

**Status values**

- `allowed` — robots.txt (or lack of block) and page meta allow this crawler.
- `blocked` — robots.txt or page-level directive (noindex, noai, or crawler-specific meta) blocks this crawler.
- `not_specified` — No rule applies for this crawler.

**Errors**

- `400` — Missing or invalid `url` (e.g. not http/https).
- `502` — Failed to fetch the URL (e.g. timeout, HTTP error).

## Run locally

```bash
cd examples/ai-bot-visibility
npm install
npm run dev
```

Then open: `http://localhost:8787/check?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/ai-bot-visibility)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- Edge networking
