---
name: experiment-docs
description: >-
  Generate or update Fumadocs MDX pages for Cloudflare Experiments workers.
  Use when adding a new experiment, updating experiment API/docs, writing
  apps/docs/content/docs/experiments/*.mdx, editing meta.json navigation, or
  when the user asks to document an experiment on the docs site.
---

# Experiment Docs

Generate and maintain docs at `apps/docs/content/docs/experiments/<name>.mdx` from the worker source in `apps/experiments/<name>/`.

## When to use

- New experiment merged or scaffolded under `apps/experiments/`
- Experiment API, bindings, routes, or README changed
- User asks to "document the experiment", "add docs page", or "update docs site"

## Source of truth (read in this order)

1. `apps/experiments/<name>/src/index.ts` — app name, description, usage on `GET /`
2. `apps/experiments/<name>/src/routes/*.ts` — endpoints, validation, response shapes, error codes
3. `apps/experiments/<name>/src/types/` — request/response types
4. `apps/experiments/<name>/wrangler.json` — bindings (AI, R2, D1, KV, browser, etc.)
5. `apps/experiments/<name>/README.md` — examples, setup notes (do not copy blindly; verify against code)
6. Closest existing doc for tone/structure:
   - **Simple** (single GET, no bindings): `apps/docs/content/docs/experiments/is-it-down.mdx`, `whereami.mdx`
   - **Full** (AI, multi-step, config): `apps/docs/content/docs/experiments/ai-website-summary.mdx`

## Workflow: new experiment

### 1. Scaffold the MDX file

From repo root:

```bash
node apps/docs/scripts/scaffold-experiment-doc.mjs <experiment-name>
```

This writes `apps/docs/content/docs/experiments/<name>.mdx` with frontmatter, deploy button, and TODO sections. Then **replace every TODO** using the source files above.

Or copy `.cursor/skills/experiment-docs/template.mdx` to `apps/docs/content/docs/experiments/<name>.mdx` and fill placeholders manually.

### 2. Write the page content

Required sections (in order):

| Section                  | Content                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Frontmatter              | `title`, `description` (matches worker; description ≤ ~160 chars for SEO)                 |
| Intro                    | 1–2 sentences: what it does + primary Cloudflare capability                               |
| API Endpoint(s)          | One `### METHOD /path` per route; params with `` **`name`** `type` `` + required/optional |
| Example request          | `curl` with `https://your-worker.workers.dev/...`                                         |
| Response fields          | Each JSON field: name, type, short description                                            |
| Example response         | Valid JSON block                                                                          |
| Error responses          | `{ error, code }` examples; list HTTP status + codes                                      |
| Use Cases                | 3–5 bullet points                                                                         |
| Deployment               | `<Steps>` with deploy button, deploy note, test curl                                      |
| Local Development        | `cd apps/experiments/<name>`, install, dev, test curl                                     |
| Cloudflare Features Used | Bullets linking to Cloudflare docs                                                        |

Optional (add when relevant):

- `<Callout type="warning">` for experimental workers or AI usage
- **Features** list (capabilities beyond raw API)
- **Implementation Details** / request flow `<Steps>` for AI or multi-hop workers
- **Configuration** — `wrangler.json` bindings, secrets, D1 schema
- **Limitations** — timeouts, size limits, local vs deployed behavior
- **Next Steps** — `<Cards>` linking to related docs or Cloudflare products

### 3. Register navigation

Edit `apps/docs/content/docs/meta.json`:

- Add `"experiments/<name>"` under the correct category separator
- Categories (use existing separators only):
  - `---AI & Machine Learning---`
  - `---Web Scraping & Parsing---`
  - `---Browser & Screenshots---`
  - `---Network & Monitoring---`
  - `---Storage & Data---`
- Pick category from primary binding/capability (see table in [reference/experiment-docs](/reference/experiment-docs))

### 4. Update repo indexes

For **new** experiments only:

- Add row to root `README.md` experiments table (name, description, deploy link)
- Deploy URL pattern:
  `https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/<name>`

### 5. Verify

```bash
cd apps/docs && npm run build
npm run dev -- --filter=docs   # spot-check /experiments/<name>
```

Confirm: OG image generates, sidebar link works, code blocks render with Google Sans Code.

## Workflow: update existing experiment docs

1. Diff `apps/experiments/<name>/` (routes, types, wrangler, README)
2. Update matching sections in `apps/docs/content/docs/experiments/<name>.mdx` only — do not rewrite unrelated sections
3. If routes renamed/added/removed, update API + curl examples + error codes
4. If bindings changed, update Deployment, Configuration, Cloudflare Features Used
5. Run `npm run build -- --filter=docs`

## MDX conventions

- **Deploy button** (required in Deployment step):

```mdx
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/<name>)
```

- **Param docs** (Fumadocs style, not Mintlify `ParamField`):

```mdx
**`url`** `string` (required)

The target URL (http or https only).
```

- **Components**: `Callout`, `Steps`/`Step`, `Cards`/`Card`, `Accordions`/`Accordion` — see `apps/docs/components/mdx.tsx`
- **External images**: plain markdown `![...](https://...)` (deploy button SVG); do not use paths that break `next/image`
- **Links**: prefer `/...` for internal pages (no `/docs` prefix); full URLs for Cloudflare developer docs
- **Code citations in prose**: use repo paths like `src/routes/check.ts` without line numbers unless referencing a specific implementation walkthrough

## Quality checklist

Before finishing:

- [ ] Every documented endpoint exists in `src/routes/` or `src/index.ts`
- [ ] Query/body params match `validateUrl` / route validation
- [ ] Error `code` strings match `jsonError(..., "CODE")` in source
- [ ] Response JSON matches TypeScript types in `src/types/`
- [ ] Local dev port is `8787` (Wrangler default)
- [ ] Deploy button URL uses `apps/experiments/<name>` path
- [ ] Page listed in `meta.json` under correct category
- [ ] No Mintlify-only syntax (`<ParamField>`, `<Icon>`, etc.)
- [ ] `npm run build` in `apps/docs` succeeds

## Do not

- Import from other experiments in docs content
- Document endpoints that are not implemented
- Use `favicon.svg` or stale Mintlify assets
- Skip `meta.json` (page won't appear in sidebar)
- Duplicate full implementation in docs when a short snippet + link to GitHub suffices

## Related skills

- `cloudflare-experiments` — scaffold worker + README + root table
- Per-experiment skills under `.cursor/skills/<name>/` — route and binding reminders when editing that worker

## Full guideline

Public reference for contributors: [Experiment documentation guide](/reference/experiment-docs) (`apps/docs/content/docs/reference/experiment-docs.mdx`).
