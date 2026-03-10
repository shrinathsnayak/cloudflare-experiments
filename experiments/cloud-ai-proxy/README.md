# Cloud AI Proxy

Call **Workers AI** with any model and prompt from a single public endpoint. Pass the model name and your prompt (or messages) and get AI-generated text back.

For available model IDs, see [Cloudflare Workers AI models](https://developers.cloudflare.com/workers-ai/models/). Use text generation models (e.g. `@cf/meta/llama-3.1-8b-instruct-fast`).

## API

### `POST /chat`

JSON body:

| Field        | Required | Description                                                       |
| ------------ | -------- | ----------------------------------------------------------------- |
| `model`      | Yes      | Workers AI model ID (e.g. `@cf/meta/llama-3.1-8b-instruct-fast`)  |
| `prompt`     | No\*     | Single prompt string                                              |
| `messages`   | No\*     | Array of `{ role: string, content: string }` for chat-style input |
| `max_tokens` | No       | Max tokens to generate (integer 1–4096)                           |

\* At least one of `prompt` or `messages` is required.

**Example**

```bash
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"@cf/meta/llama-3.1-8b-instruct-fast","prompt":"Say hello in one sentence."}'
```

**Response**

```json
{
  "response": "Hello! How can I help you today?"
}
```

### `GET /chat`

Query params: `model` (required), `prompt` (required), optional `max_tokens`.

**Example**

```http
GET /chat?model=@cf/meta/llama-3.1-8b-instruct-fast&prompt=Say%20hello
```

**Errors**

- `400` — `INVALID_BODY`, `MISSING_MODEL`, `MISSING_PROMPT`, `INVALID_MAX_TOKENS`
- `502` — `AI_ERROR` (model run failed)

## Run locally

```bash
cd experiments/cloud-ai-proxy
npm install
npm run dev
```

Then: `http://localhost:8787/chat` (POST with JSON or GET with query params).

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/cloud-ai-proxy)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

**Note:** The endpoint is public by design. For production use, consider adding rate limiting or API key authentication.

## Cloudflare features used

- Workers
- Workers AI
