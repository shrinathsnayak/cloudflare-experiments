# RSS / Atom Feed Parser

Parse RSS or Atom feeds into normalized JSON from Cloudflare's edge.

## Features

- **GET /parse?url=** - Fetches a feed URL and returns title, items, links, and dates.
- Supports RSS 2.0 and Atom.
- Caps results at 50 items. Stateless; no bindings.

## API

### `GET /parse`

| Query | Required | Description              |
| ----- | -------- | ------------------------ |
| `url` | Yes      | Feed URL (http or https) |

**Example**

```http
GET /parse?url=https://blog.cloudflare.com/rss/
```

**Errors**

- `400` `INVALID_URL` / `NOT_FEED`
- `502` `FETCH_ERROR`

## Run locally

```bash
cd apps/experiments/rss-atom-feed-parser
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rss-atom-feed-parser)

## Cloudflare features used

- Workers
- Fetch API
