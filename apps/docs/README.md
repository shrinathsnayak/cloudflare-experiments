# Cloudflare Experiments Docs

Documentation site for [Cloudflare Experiments](https://github.com/shrinathsnayak/cloudflare-experiments), built with [Fumadocs](https://fumadocs.dev) and Next.js.

Located at `apps/docs/` in the Turborepo monorepo.

## Development

```bash
# from repo root
npm install
npm run dev -- --filter=docs

# or from this directory
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (Vite dev server).

## Build & deploy

The site builds with [vinext](https://github.com/cloudflare/vinext) and deploys as the `cloudflare-experiments-docs` Worker (`wrangler.jsonc`).

```bash
npm run build     # production build
npm run preview   # build + run in workerd locally
npm run deploy    # build + wrangler deploy
```

- `NEXT_PUBLIC_*` values are inlined at build time from `.env.local` (see `.env.example`).
- Workers have no filesystem: anything read from disk must happen at build time (e.g. `<UseInYourProject>` sources are inlined by `lib/remark-experiment-source.ts`; the OG logo is generated into `lib/generated/` on postinstall).
- Analytics: `TraksProvider` loads `/t.js` and posts to `/api/event`. Proxy those paths to the Traks collector on the site Worker (or zone routes) — not in the Next app. Same-account `workers.dev` fetches fail with error 1042; use a service binding or the collector’s public URL from a different account/path as needed.
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, CSP, HSTS, and related headers live in `lib/security-headers.mjs` and are applied via `next.config.mjs` / `proxy.ts` / route handlers (`lib/security-headers.ts`).
- **API rate limits**: `/api/search` and `/api/mcp` use the Workers `API_RATE_LIMITER` binding (60 req / 60s per IP+bucket). See `wrangler.jsonc`.
- **Docs caching**: `/docs/*` and markdown exports use `s-maxage=3600` with stale-while-revalidate; search uses a short edge TTL.

## Content

- MDX pages live in `content/docs/`
- Sidebar navigation is defined in `content/docs/meta.json`
- The Self-Hosted page fetches catalog data from [awesome-cloudflare-selfhosted](https://github.com/theoephraim/awesome-cloudflare-selfhosted) and caches it for about a day via Next.js `"use cache"` (15s fetch timeout, 8MB size cap; set `SELF_HOSTED_REF` in `lib/self-hosted.ts` to a commit SHA to pin)
- New experiment pages: `node scripts/scaffold-experiment-doc.mjs <name>` (from repo root: `node apps/docs/scripts/scaffold-experiment-doc.mjs <name>`)

## URL redirects

Legacy `/docs/*` and `/introduction` paths redirect to the root URL structure via `next.config.mjs`.
