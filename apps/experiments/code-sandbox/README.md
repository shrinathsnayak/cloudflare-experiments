# Code Sandbox

Run a JavaScript snippet in an isolated environment using the **Cloudflare Sandbox SDK**.

## API

### `POST /exec`

**Body**

```json
{
  "language": "javascript",
  "code": "console.log(2 + 2)"
}
```

`code` max length 5000. Currently only `javascript` is supported.

**Response**

```json
{
  "stdout": "4\n",
  "stderr": "",
  "exitCode": 0
}
```

## Cloudflare features

- **Sandbox SDK** — `@cloudflare/sandbox` with `getSandbox` + `exec`
- **Containers** — official `cloudflare/sandbox` image
- **Durable Objects** — `Sandbox` class binding

## Run locally

Docker must be running for `wrangler dev` / deploy.

```bash
cd apps/experiments/code-sandbox
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/code-sandbox)

## Tests

```bash
npm run test
```

Unit tests mock the sandbox client so Docker is not required.
