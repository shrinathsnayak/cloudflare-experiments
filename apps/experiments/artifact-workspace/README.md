# Artifact Workspace

Artifacts-style versioned filesystem workspace. Cloudflare Artifacts bindings are still evolving, so this experiment uses an **R2 bucket** as the storage backend behind a typed `ArtifactStore` interface until a stable Artifacts binding is available.

## Features

- **PUT /files?path=** — Store text content at a path
- **GET /files?path=** — Read file content
- **GET /files/list?prefix=** — List paths (optional prefix)
- **DELETE /files?path=** — Delete a file

## API

### Path rules

- Max length 256
- Allowed characters: alphanumeric, `/`, `_`, `-`, `.`
- No `..` segments

### `PUT /files?path=`

Body is raw text. Returns `{ path, stored: true }`.

### `GET /files?path=`

Returns the file body as `text/plain`, or `404` `NOT_FOUND`.

### `GET /files/list?prefix=`

Returns `{ files: [{ path }], prefix }`.

### `DELETE /files?path=`

Returns `{ path, deleted: true }`, or `404` if missing.

**Errors**

- `400` `INVALID_PATH` — Missing or invalid path/prefix
- `404` `NOT_FOUND` — File does not exist

## Bindings

Uses R2 as an Artifacts-style mirror:

```json
"r2_buckets": [{ "binding": "ARTIFACTS", "bucket_name": "artifact-workspace" }]
```

When a stable Artifacts binding lands, the intended wrangler shape is:

```json
"artifacts": [{ "binding": "ARTIFACTS", "name": "workspace" }]
```

The `ArtifactStore` interface in `src/types/env.d.ts` isolates route code from the storage backend.

## Run locally

```bash
cd apps/experiments/artifact-workspace
npm install
npm run dev
```

Create the R2 bucket `artifact-workspace` (or update `wrangler.json`) before deploying.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/artifact-workspace)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- R2 (Artifacts-style workspace stand-in)
