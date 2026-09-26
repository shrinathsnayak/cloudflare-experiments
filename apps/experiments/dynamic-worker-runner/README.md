# Dynamic Worker Runner

Execute untrusted JavaScript via **Dynamic Workers** (Worker Loader API). Loaded workers run with `globalOutbound: null` so they cannot make network requests.

## API

### `POST /run`

**Body**

```json
{
  "code": "export default { async fetch() { return Response.json({ hello: \"world\" }); } }"
}
```

`code` must be a full ES module that exports `default { fetch }`. Max length 10,000 characters.

**Response**

```json
{ "status": 200, "body": { "hello": "world" } }
```

**Errors**

- `INVALID_CODE` — missing, empty, or too long
- `RUN_ERROR` — loader or isolate failure

## Cloudflare features

- **Worker Loader** — `worker_loaders` binding `LOADER`
- **Dynamic Workers** — runtime isolate loading with no outbound network

## Run locally

```bash
cd apps/experiments/dynamic-worker-runner
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/dynamic-worker-runner)

## Tests

```bash
npm run test
```
