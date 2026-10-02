# Newsletter Digest

Forward newsletters to an **Email Routing** address and get one AI-summarized digest email per day instead of a dozen. The `email()` handler parses each message with `postal-mime`, summarizes it with **Workers AI** (`@cf/meta/llama-3.1-8b-instruct-fast`, 2–3 bullets), and stores it in **D1**. A daily **Cron Trigger** groups undigested items by sender and sends a single digest via the `send_email` binding.

## How it works

1. Email arrives at the routed address → `email()` handler
2. Over 1 MB → rejected (`setReject`). Sender not in `ALLOWED_SENDERS` → ignored (dropped silently)
3. Text body (or HTML stripped to text) → Workers AI summary; on AI failure, the first 300 characters
4. First non-unsubscribe link is kept alongside the summary
5. `0 7 * * *` cron → digest of undigested items, grouped by sender → `DIGEST_TO`; items are marked digested only after the send succeeds

## API

| Method | Path                  | Auth                 | Description                                                  |
| ------ | --------------------- | -------------------- | ------------------------------------------------------------ |
| `GET`  | `/items?pending=true` | public               | Latest 100 items (`pending=true` for undigested)             |
| `POST` | `/digest/preview`     | public               | Build the digest (`subject`, `text`, `html`) without sending |
| `POST` | `/digest/send`        | `Bearer ADMIN_TOKEN` | Send the digest now and mark items digested                  |

```bash
curl "$WORKER/items?pending=true"
curl -X POST "$WORKER/digest/preview"
curl -X POST "$WORKER/digest/send" -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Configuration

- `AI` — Workers AI
- `DB` (D1) — `items` table (`migrations/0000_init.sql`)
- `EMAIL` (`send_email`) — digest delivery
- Cron — `0 7 * * *`
- Vars — `DIGEST_FROM` (address on a domain onboarded to Email Sending), `DIGEST_TO`, `ALLOWED_SENDERS` (comma-separated addresses or domains; empty accepts all)
- Secret — `ADMIN_TOKEN`

`ALLOWED_SENDERS` is checked against both the envelope sender and the `From` header, so newsletters auto-forwarded from Gmail/Outlook still match the original sender.

## Local development

```bash
npm install
npx wrangler d1 migrations apply newsletter-digest-db --local
npx wrangler dev --test-scheduled

curl -X POST "http://localhost:8787/cdn-cgi/handler/email?from=news@example.com&to=digest@example.com" \
  --data-binary $'From: Example News <news@example.com>\r\nTo: digest@example.com\r\nSubject: Issue 1\r\nContent-Type: text/plain\r\n\r\nBig news this week. https://example.com/1'

curl -X POST "http://localhost:8787/digest/preview"
curl "http://localhost:8787/__scheduled?cron=0+7+*+*+*"
```

Workers AI calls go to your Cloudflare account even in local dev.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/newsletter-digest)

After deploy:

1. `npx wrangler d1 migrations apply newsletter-digest-db --remote`
2. `npx wrangler secret put ADMIN_TOKEN`
3. Enable Email Routing on your zone and add a custom address (e.g. `digest@yourdomain.com`) with action **Send to a Worker** → `newsletter-digest`
4. Onboard a sending domain (`npx wrangler email sending enable yourdomain.com`) and set `DIGEST_FROM` / `DIGEST_TO`
5. Subscribe to newsletters with the routed address, or forward them there
