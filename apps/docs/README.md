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

Open [http://localhost:3000](http://localhost:3000) for the introduction page.

## Build

```bash
npm run build
npm start
```

## Content

- MDX pages live in `content/docs/`
- Sidebar navigation is defined in `content/docs/meta.json`
- Mintlify content can be re-imported from the [docs repo](https://github.com/shrinathsnayak/docs) with:

```bash
node scripts/migrate-mintlify.mjs /path/to/mintlify-docs-repo
```

## URL redirects

Legacy `/docs/*` and `/introduction` paths redirect to the root URL structure via `next.config.mjs`.

## IndexNow

Search engines (Bing, Yandex, Naver, and others) are notified of URL changes via [IndexNow](https://www.indexnow.org/).

Env vars (see `.env.example`):

| Variable                  | Where                            | Purpose                                                      |
| ------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `INDEXNOW_KEY`            | Vercel Production + `.env.local` | Ownership key served at `/indexnow-key.txt`                  |
| `INDEXNOW_WEBHOOK_SECRET` | Vercel Production + `.env.local` | Auth for `POST /api/indexnow` (Vercel webhook HMAC + Bearer) |

### Automatic (recommended): Vercel webhook

After merge → production deploy succeeds, Vercel calls your own API — no GitHub Actions.

1. Deploy with `INDEXNOW_KEY` and `INDEXNOW_WEBHOOK_SECRET` set in Vercel
2. Vercel → **Settings → Webhooks** (team or project) → create webhook:
   - URL: `https://cloudflare-experiments.com/api/indexnow`
   - Events: **Deployment Succeeded**
   - Secret: same value as `INDEXNOW_WEBHOOK_SECRET`
3. The route ignores preview deploys; it only submits when `target === "production"` (and `main` when commit ref is present)

### Manual trigger

```bash
curl -X POST https://cloudflare-experiments.com/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_WEBHOOK_SECRET" \
  -H "Content-Type: application/json"
```
