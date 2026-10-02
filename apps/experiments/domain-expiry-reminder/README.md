# Domain Expiry Reminder

Never let a domain or TLS certificate expire. Registration expiry comes from **RDAP** (IANA bootstrap → registry server, falling back to `rdap.org`), certificate expiry from **Certificate Transparency** logs via `crt.sh`. A daily Cron Trigger checks every watched domain and emails a reminder when days-left crosses **30**, **7**, and **1** — each threshold is sent once per expiry date.

## API

| Method   | Path              | Description                                                 |
| -------- | ----------------- | ----------------------------------------------------------- |
| `POST`   | `/domains`        | Watch a domain (`{ "domain": "...", "alertEmail": "..." }`) |
| `GET`    | `/domains/:id`    | Run a live check for a watched domain and return its status |
| `DELETE` | `/domains/:id`    | Stop watching a domain                                      |
| `GET`    | `/lookup?domain=` | One-off check without saving                                |

`domain` must be a bare hostname (`example.com`, not `https://example.com`).

### Example

```bash
curl "$WORKER/lookup?domain=example.com"

curl -X POST "$WORKER/domains" \
  -H "content-type: application/json" \
  -d '{"domain":"example.com","alertEmail":"ops@example.com"}'
```

```json
{
  "domain": "example.com",
  "checkedAt": "2026-10-01T09:00:00.000Z",
  "registration": {
    "expiresAt": "2027-08-13T04:00:00.000Z",
    "daysLeft": 315,
    "registrar": "RESERVED-Internet Assigned Numbers Authority"
  },
  "certificate": {
    "expiresAt": "2027-01-15T23:59:59.000Z",
    "daysLeft": 106,
    "issuer": "DigiCert Inc - DigiCert Global G3 TLS ECC SHA384 2020 CA1"
  }
}
```

When a source fails, its field is `null` and `errors.registration` / `errors.certificate` explains why. crt.sh is slow and often returns 5xx; lookups time out after 10 seconds.

## Bindings

- `DB` (D1) — `domains` and `reminders` tables (`migrations/0000_init.sql`)
- `EMAIL` (`send_email`) — reminder emails
- Cron trigger — `0 9 * * *` (daily, 09:00 UTC)
- Var `ALERT_FROM_EMAIL` — sender on a domain onboarded to Email Sending

## Local development

```bash
npm install
npx wrangler d1 migrations apply domain-expiry-reminder-db --local
npm run dev
curl "http://localhost:8787/__scheduled?cron=0+9+*+*+*"   # with `wrangler dev --test-scheduled`
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/domain-expiry-reminder)

After deploy:

1. `npx wrangler d1 migrations apply domain-expiry-reminder-db --remote`
2. Onboard a sending domain (`npx wrangler email sending enable yourdomain.com`) and set `ALERT_FROM_EMAIL` to an address on it.
