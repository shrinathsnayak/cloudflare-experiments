# Accessibility Auditor

Run [axe-core](https://github.com/dequelabs/axe-core) WCAG 2.0/2.1 A + AA audits against any page with **Cloudflare Browser Rendering**, and suggest alt text for images that lack it using a **Workers AI** vision model.

## API

### `GET /audit`

| Query     | Required | Description                                                         |
| --------- | -------- | ------------------------------------------------------------------- |
| `url`     | Yes      | Page URL (http or https)                                            |
| `altText` | No       | `true` to generate alt text for up to 5 `<img>` elements missing it |

```http
GET /audit?url=https://dequeuniversity.com/demo/mars/&altText=true
```

```json
{
  "url": "https://dequeuniversity.com/demo/mars/",
  "score": 35,
  "counts": { "critical": 3, "serious": 5, "moderate": 0, "minor": 0 },
  "violations": [
    {
      "id": "image-alt",
      "impact": "critical",
      "help": "Images must have alternate text",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/image-alt?application=axeAPI",
      "totalNodes": 4,
      "nodes": [{ "target": ["#hero > img"], "html": "<img src=\"...\">" }]
    }
  ],
  "passes": 29,
  "incomplete": 3,
  "altSuggestions": [
    {
      "src": "https://dequeuniversity.com/assets/demo-sites/mars/images/mars-spaceman.jpg",
      "suggestion": "A space suit with a helmet on a rocky surface."
    }
  ]
}
```

- `counts` counts violated **rules** by impact; `totalNodes` is the number of failing elements per rule (max 10 returned, HTML truncated to 300 chars).
- `score` (0–100) is a weighted pass ratio: each violated rule costs 10 (critical), 5 (serious), 3 (moderate) or 1 (minor) passed rules.
- `altSuggestions` entries carry `suggestion: null` and an `error` when an image can't be fetched (non-`image/*`, > 2 MB) or described.

### `POST /alt-text`

Send image bytes (`Content-Type: image/*`, max 2 MB) **or** pass `?image=<url>`.

```bash
curl -X POST "http://localhost:8787/alt-text" -H "Content-Type: image/jpeg" --data-binary @photo.jpg
```

```json
{
  "altText": "A red bicycle leaning against a brick wall.",
  "model": "@cf/llava-hf/llava-1.5-7b-hf"
}
```

### Errors

| Status | Code                     | When                                         |
| ------ | ------------------------ | -------------------------------------------- |
| 400    | `INVALID_URL`            | Missing/invalid `url` or `image`             |
| 400    | `INVALID_QUERY`          | `altText` is not `true` / `false`            |
| 400    | `MISSING_IMAGE`          | Empty image body                             |
| 413    | `PAYLOAD_TOO_LARGE`      | Image over 2 MB                              |
| 415    | `UNSUPPORTED_MEDIA_TYPE` | Body / remote image is not `image/*`         |
| 502    | `FETCH_ERROR`            | Remote image fetch failed (`POST /alt-text`) |
| 502    | `BROWSER_ERROR`          | Navigation or axe-core injection failed      |
| 502    | `AI_ERROR`               | Workers AI call failed                       |

## Notes

- `wrangler.json` sets `"keep_names": false`. `axe.source` is axe-core's function stringified from the bundle; with Wrangler's default `keep_names` esbuild injects `__name()` helpers into it that don't exist in the page.
- `page.setBypassCSP(true)` lets the inline axe script run on sites with strict CSP; if the page reloads itself (meta refresh) axe is re-injected once.

## Run locally

```bash
cd apps/experiments/accessibility-auditor
npm install
npm run dev
```

`http://localhost:8787/audit?url=https://example.com`

Workers AI always runs remotely (requires `wrangler login`).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/accessibility-auditor)

Requires Browser Rendering and Workers AI on your account.

## Cloudflare features used

- Workers
- Browser Rendering (`@cloudflare/puppeteer`)
- Workers AI (`@cf/llava-hf/llava-1.5-7b-hf` image-to-text)
