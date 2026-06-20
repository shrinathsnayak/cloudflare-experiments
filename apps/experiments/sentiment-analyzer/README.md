# Sentiment Analyzer

Analyze text sentiment with **Workers AI** using DistilBERT at the edge.

## API

### `GET /sentiment`

| Query  | Required | Description                              |
| ------ | -------- | ---------------------------------------- |
| `text` | Yes      | Text to classify (max 10,000 characters) |

**Example**

```http
GET /sentiment?text=This pizza is great!
```

**Response**

```json
{
  "text": "This pizza is great!",
  "label": "POSITIVE",
  "score": 0.9998
}
```

**Errors**

- `400` - `INVALID_TEXT`
- `502` - `AI_ERROR` (model run failed)

## Run locally

```bash
cd apps/experiments/sentiment-analyzer
npm install
npm run dev
```

Then open: `http://localhost:8787/sentiment?text=This%20pizza%20is%20great!`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/sentiment-analyzer)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (`@cf/huggingface/distilbert-sst-2-int8`)
