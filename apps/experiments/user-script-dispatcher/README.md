# User Script Dispatcher

Workers for Platforms style **dispatch** — register customers and run tenant response handlers via a `DispatchNamespace` binding, with a KV fallback for local demos.

## API

### `POST /scripts`

Store a JSON response handler (safe demo — no dynamic JS eval).

| Field      | Required | Description                         |
| ---------- | -------- | ----------------------------------- |
| `name`     | Yes      | Tenant/script name (`a-zA-Z0-9_-`)  |
| `response` | Yes      | JSON object returned on KV dispatch |

Max serialized size: 10,000 bytes.

### `GET /scripts?name=`

Returns `{ name, updatedAt, hasResponse }`.

### `POST /dispatch/:name`

- If `DISPATCHER` is bound: forwards the request to `env.DISPATCHER.get(name).fetch(request)`.
- If `DISPATCHER.get` throws: `{ error, code: "DISPATCH_ERROR" }` (502).
- Without `DISPATCHER`: returns the stored KV `response` object.

### `POST /register`

| Field  | Required | Description   |
| ------ | -------- | ------------- |
| `name` | Yes      | Customer name |

Records the customer in KV for listing.

### `GET /customers`

Returns `{ customers: string[] }`.

## Run locally

```bash
cd apps/experiments/user-script-dispatcher
npm install
npm run dev
```

Create a KV namespace and update `wrangler.json`. For production Workers for Platforms dispatch, create a dispatch namespace (`demo-customers`) matching `dispatch_namespaces` in `wrangler.json`. Local/KV fallback works without the paid feature.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/user-script-dispatcher)

## Cloudflare features used

- Workers
- Workers KV
- Workers for Platforms (`dispatch_namespaces`) — optional
