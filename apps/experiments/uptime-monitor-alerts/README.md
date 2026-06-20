# Uptime Monitor Alerts

Register URL monitors, run scheduled health checks from the edge, and send email alerts when a monitor transitions from up to down.

## API

| Method   | Path                    | Description                                                  |
| -------- | ----------------------- | ------------------------------------------------------------ |
| `POST`   | `/monitors`             | Register a monitor (`{ "url": "...", "alertEmail": "..." }`) |
| `DELETE` | `/monitors/:id`         | Remove a monitor                                             |
| `GET`    | `/monitors/:id/history` | Check history and uptime percentage                          |

### Example

```bash
curl -X POST "$WORKER/monitors" \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com","alertEmail":"ops@example.com"}'

curl "$WORKER/monitors/1/history"
```

## Bindings

- `DB` (D1) — monitors, checks, and alert records
- `EMAILER` (`send_email`) — optional outbound alert email
- Cron trigger — `*/5 * * * *`

Set `ALERT_FROM_EMAIL` in `wrangler.json` to a verified sender address for your account.

## Local development

```bash
npm install
npx wrangler d1 migrations apply uptime-monitor-alerts-db --local
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/cloudflare-experiments/tree/main/apps/experiments/uptime-monitor-alerts)

After deploy, apply D1 migrations and configure Email Routing / Email Service for the `EMAILER` binding.
