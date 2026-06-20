# DNS Propagation Checker

Compare DNS answers from Cloudflare, Google, and Quad9 resolvers in parallel to detect propagation drift.

## API

### `GET /check?domain=&type=`

| Query    | Required | Description                                                        |
| -------- | -------- | ------------------------------------------------------------------ |
| `domain` | Yes      | Bare domain name (e.g. `example.com`)                              |
| `type`   | No       | Record type: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS` (default `A`) |

Returns agreement status, consensus values, and per-resolver response times.

## Run locally

```bash
cd apps/experiments/dns-propagation-checker
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/dns-propagation-checker)

## Cloudflare features used

- Workers
- Fetch API
- DNS over HTTPS (Cloudflare, Google, Quad9)
