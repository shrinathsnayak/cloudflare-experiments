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
npm run build     # production build (clears dist first)
npm run preview   # build + run in workerd locally
npm run deploy    # build + wrangler deploy
npm run deploy:version  # build + wrangler versions upload (preview URL first)
```

### Local

- `NEXT_PUBLIC_*` values are inlined at build time from `.env.local` (see `.env.example`).
- Workers have no filesystem: anything read from disk must happen at build time (e.g. `<UseInYourProject>` sources are inlined by `lib/remark-experiment-source.ts`; the OG logo and Agent Skills discovery payload are generated into `lib/generated/` on postinstall / build from `.cursor/skills/`).
- Agent Skills Discovery ([RFC v0.2.0](https://github.com/cloudflare/agent-skills-discovery-rfc)): `GET /.well-known/agent-skills/index.json` and per-skill `SKILL.md` artifacts under `/.well-known/agent-skills/{name}/SKILL.md`.

### Cloudflare Workers Builds (CI)

Configure the Worker under **Settings → Builds**:

| Setting         | Suggested value                                                                         |
| --------------- | --------------------------------------------------------------------------------------- |
| Root directory  | `apps/docs`                                                                             |
| Build command   | `cd ../.. && npm ci && cd apps/docs && npm run build` (monorepo install from repo root) |
| Deploy command  | `npx wrangler deploy`                                                                   |
| Build variables | `NEXT_PUBLIC_TRAKS_SITE` = your Traks site key (`pb_live_…`)                            |

Without `NEXT_PUBLIC_TRAKS_SITE` as a **build** variable, production HTML used to 500 (`next-traks: site is required`) while `/api/*` still worked. The layout now skips Traks when the key is missing, but analytics will stay off until the build var is set.

Optional: `NEXT_PUBLIC_SITE_URL=https://cloudflare-experiments.com` for absolute OG/canonical URLs.

- Analytics: `TraksProvider` loads `/t.js` and posts to `/api/event`. Proxy those paths to the Traks collector on the site Worker (or zone routes) - not in the Next app. Same-account `workers.dev` fetches fail with error 1042; use a service binding or the collector’s public URL from a different account/path as needed.
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, CSP, HSTS, and related headers live in `lib/security-headers.mjs` and are applied via `proxy.ts` / route handlers (`lib/security-headers.ts`). Do **not** put them in `next.config.mjs` `headers()` - that path has taken Workers page renders offline with vinext + `cacheComponents`.
- **API rate limits**: `/api/search` and `/api/mcp` use the Workers `API_RATE_LIMITER` binding (60 req / 60s per IP+bucket). See `wrangler.jsonc`.
- **API catalog (RFC 9727)**: `/.well-known/api-catalog` (`application/linkset+json`) lists Search + MCP with OpenAPI at `/openapi.json` (also `/openapi/search.json` and `/openapi/mcp.json`), plus `/api/health`.
- **Agent readiness**: Markdown `Accept` negotiation on `/` and `/docs`; Markdown 404 bodies for unknown paths; JSON `{ error, code, hint }` on unknown `/api/*`; trust pages at `/about`, `/contact`, `/privacy`; developer index at `/developers`.
- **Docs caching**: `/docs/*` and markdown exports use `s-maxage=3600` with stale-while-revalidate (middleware / route handlers); search uses a short edge TTL. Vinext may still force `no-store` for dynamic document responses.

## Content

- MDX pages live in `content/docs/`
- Sidebar navigation is defined in `content/docs/meta.json`
- The Self-Hosted page fetches catalog data from [awesome-cloudflare-selfhosted](https://github.com/theoephraim/awesome-cloudflare-selfhosted) and caches it for about a day via Next.js `"use cache"` (15s fetch timeout, 8MB size cap; set `SELF_HOSTED_REF` in `lib/self-hosted.ts` to a commit SHA to pin)
- New experiment pages: `node scripts/scaffold-experiment-doc.mjs <name>` (from repo root: `node apps/docs/scripts/scaffold-experiment-doc.mjs <name>`)

## URL redirects

Legacy `/docs/*` and `/introduction` paths redirect to the root URL structure via `next.config.mjs`.
