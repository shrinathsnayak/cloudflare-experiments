# Vectorize Search

Semantic search with **Workers AI** embeddings and **Vectorize** at the edge. Upsert text documents as vectors, then query by natural language.

## Prerequisites

Create the Vectorize index before deploying:

```bash
wrangler vectorize create experiment-search --dimensions=768 --metric=cosine
```

The index name must match `experiment-search` in `wrangler.json` (768 dimensions, cosine metric for `@cf/baai/bge-base-en-v1.5`).

## API

### `POST /upsert`

| Field  | Required | Description                      |
| ------ | -------- | -------------------------------- |
| `id`   | Yes      | Unique document id (non-empty)   |
| `text` | Yes      | Text to embed (max 10,000 chars) |

**Example**

```http
POST /upsert
Content-Type: application/json

{ "id": "doc-1", "text": "Cloudflare Workers run at the edge" }
```

**Response**

```json
{ "id": "doc-1" }
```

### `GET /search`

| Query  | Required | Description                          |
| ------ | -------- | ------------------------------------ |
| `q`    | Yes      | Search query (max 10,000 characters) |
| `topK` | No       | Results to return (1–20, default 5)  |

**Example**

```http
GET /search?q=edge computing&topK=5
```

**Response**

```json
{
  "query": "edge computing",
  "results": [{ "id": "doc-1", "score": 0.87, "text": "Cloudflare Workers run at the edge" }]
}
```

**Errors**

- `400` - `INVALID_BODY`, `INVALID_ID`, `INVALID_TEXT`, `INVALID_QUERY`, `INVALID_TOP_K`
- `502` - `VECTORIZE_ERROR` (embedding or Vectorize operation failed)

## Run locally

```bash
cd apps/experiments/vectorize-search
npm install
wrangler vectorize create experiment-search --dimensions=768 --metric=cosine
npm run dev
```

Requires a Cloudflare account with Workers AI and Vectorize enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/vectorize-search)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (`@cf/baai/bge-base-en-v1.5`)
- Vectorize (`experiment-search`, 768 dims, cosine)
