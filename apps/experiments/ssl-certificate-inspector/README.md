# SSL Certificate Inspector

Inspect TLS certificate metadata for a domain using Certificate Transparency logs and an HTTPS reachability probe from the edge.

## API

### `GET /inspect?domain=example.com`

Returns issuer, subject, validity dates, days until expiry, SAN list, and reachability.

**Note:** Full live certificate chain inspection is limited in Workers. This experiment uses crt.sh (CT logs) for certificate fields and a HEAD request to verify HTTPS reachability.

## Run locally

```bash
cd apps/experiments/ssl-certificate-inspector
npm install
npm run dev
curl "http://localhost:8787/inspect?domain=cloudflare.com"
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ssl-certificate-inspector)
