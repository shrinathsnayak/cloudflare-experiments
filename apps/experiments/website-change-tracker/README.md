# Website Change Tracker

Track website content changes with scheduled Browser Rendering snapshots. Rendered page text is stored in R2, while content hashes and diff summaries are persisted in D1.

## API

| Method   | Path            | Description                                                           |
| -------- | --------------- | --------------------------------------------------------------------- |
| `POST`   | `/track`        | Register a URL for tracking (`{ "url": "https://example.com" }`)      |
| `DELETE` | `/track?url=`   | Unregister a tracked URL                                              |
| `GET`    | `/history?url=` | List snapshot history with content hash, diff summary, and timestamps |

### Example

```bash
curl -X POST "$WORKER/track" \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com"}'

curl "$WORKER/history?url=https://example.com"
```

## Bindings

- `DB` (D1) — tracked URLs and snapshot metadata
- `SNAPSHOTS` (R2) — rendered text snapshots
- `BROWSER` — Browser Rendering for page text extraction
- Cron trigger — `*/30 * * * *`

## Local development

```bash
npm install
npx wrangler d1 migrations apply website-change-tracker-db --local
npm run dev
```

Browser Rendering requires remote dev:

```bash
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/cloudflare-experiments/tree/main/apps/experiments/website-change-tracker)

After deploy, apply D1 migrations and create the R2 bucket in your account.
