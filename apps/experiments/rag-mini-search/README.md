# RAG Mini Search

Grounded Q&A over a small corpus of experiment descriptions using Vectorize retrieval and Workers AI generation.

## Setup

1. Create a Vectorize index named `rag-mini-search` (or update `wrangler.json`).
2. Deploy or run locally, then seed the index:

```bash
npm run dev
npm run seed
```

## API

- **POST /seed** — Embed and upsert demo experiment docs into Vectorize
- **POST /ask** — `{ "question": "..." }` → grounded answer with cited source titles

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/rag-mini-search)

## Cloudflare features used

- Vectorize
- Workers AI (embeddings + LLM)
