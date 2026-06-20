# JWT Inspector

Decode JWT header/payload without verification, verify signatures (HS256/RS256), and issue test HS256 tokens.

## API

- **POST /decode** — `{ "token": "..." }`
- **POST /verify** — `{ "token": "...", "secret": "..." }` or `{ "publicKey": "-----BEGIN PUBLIC KEY-----..." }`
- **POST /issue** — `{ "secret": "...", "subject": "...", "expiresInSeconds": 3600 }`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/jwt-inspector)
