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
