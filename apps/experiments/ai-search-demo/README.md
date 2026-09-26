# AI Search Demo

Query **Cloudflare AI Search** (managed RAG, formerly AutoRAG) from a Worker via the Workers AI binding.

## Setup

1. Create an AI Search instance in the Cloudflare dashboard and index your data source.
2. Set `INSTANCE_NAME` in `wrangler.json` `vars` to that instance name (default: `demo-index`).

```json
{
  "ai": { "binding": "AI" },
  "vars": { "INSTANCE_NAME": "my-autorag" }
}
```

This experiment uses the legacy `env.AI.autorag(name).aiSearch({ query })` API. Newer projects can migrate to dedicated `ai_search` bindings — see [AI Search Workers binding docs](https://developers.cloudflare.com/ai-search/api/search/workers-binding/).

## API

### `GET /search?q=`

| Param | Required | Description            |
| ----- | -------- | ---------------------- |
| `q`   | Yes      | Natural language query |

**Response**

```json
{
  "answer": "Generated answer from AI Search",
  "results": [],
  "query": "your question",
  "instance": "demo-index"
}
```

**Errors**

- `400` - `INVALID_QUERY`
- `502` - `SEARCH_ERROR`

## Run locally

```bash
cd apps/experiments/ai-search-demo
npm install
npm run dev
```

AI Search typically requires a remote instance (`wrangler` may need remote AI / account access).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-search-demo)

## Cloudflare features used

- Workers AI
- AI Search / AutoRAG
