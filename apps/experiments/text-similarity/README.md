# Text Similarity

Compare text similarity with **Workers AI** embeddings and cosine similarity at the edge.

## API

### `GET /similarity`

| Query   | Required | Description                         |
| ------- | -------- | ----------------------------------- |
| `text1` | Yes      | First text (max 10,000 characters)  |
| `text2` | Yes      | Second text (max 10,000 characters) |

**Example**

```http
GET /similarity?text1=hello world&text2=hello there
```

**Response**

```json
{
  "text1": "hello world",
  "text2": "hello there",
  "similarity": 0.82
}
```

The `similarity` score is a float between 0 and 1.

**Errors**

- `400` - `INVALID_TEXT1` or `INVALID_TEXT2`
- `502` - `AI_ERROR` (model run failed)

## Run locally

```bash
cd apps/experiments/text-similarity
npm install
npm run dev
```

Then open: `http://localhost:8787/similarity?text1=hello&text2=hi`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/text-similarity)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (`@cf/baai/bge-base-en-v1.5`)
