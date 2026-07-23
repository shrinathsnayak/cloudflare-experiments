# Email Auth Checker

Analyze SPF, DMARC, and DKIM email authentication records for a domain using Cloudflare DNS over HTTPS.

## Features

- **GET /check?domain=** - Looks up MX, SPF, DMARC, and common DKIM selectors.
- Accepts a bare domain or an https URL (hostname is extracted).
- Returns pass/warn/fail guidance plus a summary of issues.
- Stateless; no bindings.

## API

### `GET /check`

| Query    | Required | Description                                     |
| -------- | -------- | ----------------------------------------------- |
| `domain` | Yes      | Domain name or http(s) URL (hostname extracted) |

**Example**

```http
GET /check?domain=cloudflare.com
```

**Response**

```json
{
  "domain": "cloudflare.com",
  "mx": [{ "priority": 10, "exchange": "isaac.mx.cloudflare.net" }],
  "spf": {
    "status": "pass",
    "record": "v=spf1 include:_spf.mx.cloudflare.net -all",
    "detail": "SPF record present"
  },
  "dmarc": {
    "status": "pass",
    "record": "v=DMARC1; p=reject; ...",
    "policy": "reject",
    "detail": "DMARC policy is reject"
  },
  "dkim": {
    "status": "warn",
    "selectorsChecked": ["google", "selector1", "selector2", "default", "k1"],
    "found": [],
    "detail": "No DKIM keys found for common selectors..."
  },
  "summary": {
    "status": "warn",
    "issues": ["No DKIM keys found for common selectors..."]
  }
}
```

**Errors**

- `400` `INVALID_DOMAIN` - Missing or invalid `domain`
- `502` `DNS_ERROR` - DoH lookup failed

## Run locally

```bash
cd apps/experiments/email-auth-checker
npm install
npm run dev
```

Then open: `http://localhost:8787/check?domain=cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/email-auth-checker)

## Cloudflare features used

- Workers
- DNS over HTTPS (cloudflare-dns.com)
- Edge networking
