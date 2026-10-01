# Access JWT Validator

Verify [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/) JWTs inside a Worker with [`jose`](https://github.com/panva/jose). The token is read from the `Cf-Access-Jwt-Assertion` header (or the `CF_Authorization` cookie) and checked against your team's JWKS at `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`, with issuer = team domain and audience = the application's AUD tag.

## API

- **GET /** — App info and whether `TEAM_DOMAIN` / `POLICY_AUD` are configured
- **GET /me** — Verified identity claims (`email`, `sub`, `country`, `identity_nonce`, `iat`, `exp`, …)
- **GET /protected** — Example route behind the `requireAccess` Hono middleware

Errors: `{ error, code }` with `401` (`MISSING_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`), `500` (`NOT_CONFIGURED`), or `502` (`JWKS_UNAVAILABLE`).

## Setup

1. Zero Trust → **Access** → **Applications** → add a **Self-hosted** application for the Worker's hostname (or enable Access on the Worker's `workers.dev` / custom domain under **Settings → Domains & Routes**).
2. Copy the application's **Application Audience (AUD) Tag** into `POLICY_AUD`.
3. Set `TEAM_DOMAIN` to `https://<your-team>.cloudflareaccess.com` (Zero Trust → Settings → Custom Pages / team name).

> Never trust `Cf-Access-Authenticated-User-Email` on its own — anyone who can reach the origin directly can set it. Always verify the JWT.

## Run locally

```bash
cd apps/experiments/access-jwt-validator
npm install
npm run dev
# Paste a real token (e.g. from `cloudflared access token -app=https://your-app.example.com`)
curl http://localhost:8787/me -H "Cf-Access-Jwt-Assertion: <jwt>"
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/access-jwt-validator)

## Cloudflare features used

- Cloudflare Access (Zero Trust)
- Workers
