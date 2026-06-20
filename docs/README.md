# Cloudflare Experiments Docs

Documentation site for [Cloudflare Experiments](https://github.com/shrinathsnayak/cloudflare-experiments), built with [Fumadocs](https://fumadocs.dev) and Next.js.

This replaces the previous [Mintlify](https://mintlify.com) docs hosted at [cloudflare-experiments.com](https://cloudflare-experiments.com).

## Development

```bash
cd docs
npm install
npm run dev
```

Open [http://localhost:3000/introduction](http://localhost:3000/introduction).

## Build

```bash
npm run build
npm start
```

## Content

- MDX files live in `content/docs/`
- Sidebar navigation is configured in `content/docs/meta.json`
- The Reference tab uses a separate root in `content/docs/reference/meta.json`

## Migrating from Mintlify

To refresh content from the legacy Mintlify repo:

```bash
node scripts/migrate-mintlify.mjs /path/to/mintlify-docs
```

The script converts Mintlify components (`CardGroup`, `Note`, `Steps`, `CodeGroup`, etc.) to Fumadocs equivalents.

## Deploy

Deploy as a standard Next.js app (Vercel, Cloudflare Pages, etc.). Set the project root to `docs/`.
