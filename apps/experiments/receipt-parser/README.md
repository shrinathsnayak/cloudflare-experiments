# Receipt Parser

Turn a receipt or invoice (PDF or photo) into structured JSON or a CSV row. The file is converted to Markdown with **Workers AI Markdown Conversion** (`env.AI.toMarkdown`, which describes images with a vision model), then a JSON-mode LLM (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) extracts the fields. Output is normalized and sanity-checked in code.

## API

### `POST /parse`

Send the file as the raw request body, or as multipart form field `file`. Supported: PDF, JPEG, PNG, WebP (detected from the file bytes), max 10MB.

| Query    | Required | Description                                    |
| -------- | -------- | ---------------------------------------------- |
| `format` | No       | `json` (default) or `csv`                      |
| `name`   | No       | File name for raw bodies (default `receipt.*`) |

**Example**

```bash
curl -X POST "http://localhost:8787/parse?name=lunch.jpg" \
  -H "Content-Type: image/jpeg" \
  --data-binary @lunch.jpg

curl -X POST "http://localhost:8787/parse?format=csv" -F "file=@invoice.pdf"
```

**Response**

```json
{
  "fileName": "lunch.jpg",
  "mimeType": "image/jpeg",
  "markdownPreview": "# lunch.jpg\n\n## Description\nA receipt from Corner Cafe...",
  "receipt": {
    "vendor": "Corner Cafe",
    "date": "2026-09-01",
    "currency": "USD",
    "subtotal": 7,
    "tax": 0.56,
    "tip": 1.5,
    "total": 9.06,
    "lineItems": [
      { "description": "Bagel", "quantity": 2, "unitPrice": 2.5, "amount": 5 },
      { "description": "Tea", "quantity": 1, "unitPrice": 2, "amount": 2 }
    ],
    "paymentMethod": "Visa ****4242",
    "category": "food"
  },
  "warnings": []
}
```

Missing fields are `null`. `warnings` flags missing vendor/date/total, line items that don't sum to the subtotal, and subtotal + tax + tip that doesn't match the total.

With `?format=csv` the response is `text/csv` with a header line and one row: `fileName,vendor,date,currency,subtotal,tax,tip,total,paymentMethod,category,lineItemCount,warnings`.

**Errors**

- `400` - `MISSING_FILE`, `INVALID_QUERY`
- `413` - `PAYLOAD_TOO_LARGE`
- `415` - `UNSUPPORTED_MEDIA_TYPE`
- `502` - `CONVERSION_ERROR` (Markdown conversion failed), `AI_ERROR` (extraction model failed)

## Run locally

```bash
cd apps/experiments/receipt-parser
npm install
npm run dev
```

Requires a Cloudflare account with Workers AI enabled (the `AI` binding runs remotely in `wrangler dev`).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/receipt-parser)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI Markdown Conversion (`env.AI.toMarkdown`)
- Workers AI JSON mode (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
