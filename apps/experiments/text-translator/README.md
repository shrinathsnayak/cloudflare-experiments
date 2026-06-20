# Text Translator

Translate text with **Workers AI** using Meta's m2m100 model at the edge.

## API

### `GET /translate`

| Query    | Required | Description                               |
| -------- | -------- | ----------------------------------------- |
| `text`   | Yes      | Text to translate (max 10,000 characters) |
| `target` | Yes      | Target language code (e.g. `es`, `fr`)    |
| `source` | No       | Source language code (default: `en`)      |

**Example**

```http
GET /translate?text=hello&target=es&source=en
```

**Response**

```json
{
  "text": "hello",
  "source": "en",
  "target": "es",
  "translation": "hola"
}
```

**Errors**

- `400` - `INVALID_TEXT`, `INVALID_TARGET`, or `INVALID_SOURCE`
- `502` - `AI_ERROR` (model run failed)

## Run locally

```bash
cd apps/experiments/text-translator
npm install
npm run dev
```

Then open: `http://localhost:8787/translate?text=hello&target=es`

Requires a Cloudflare account with Workers AI enabled.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/text-translator)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (`@cf/meta/m2m100-1.2b`)
