# API Mock Server

Create configurable HTTP mocks with **Workers KV** and serve them from the edge.

## API

### `POST /configs`

Create a mock endpoint configuration.

| Field     | Required | Description                                     |
| --------- | -------- | ----------------------------------------------- |
| `path`    | Yes      | Request path to match (must start with `/`)     |
| `method`  | Yes      | HTTP method (`GET`, `POST`, `PUT`, etc.)        |
| `status`  | Yes      | HTTP status code (100–599)                      |
| `body`    | Yes      | JSON-serializable response body                 |
| `delayMs` | No       | Artificial delay before responding (0–30000 ms) |

**Example**

```http
POST /configs
Content-Type: application/json

{
  "path": "/users/1",
  "method": "GET",
  "status": 200,
  "body": { "id": 1, "name": "Ada" },
  "delayMs": 250
}
```

Returns `{ slug, path, method, status, body, delayMs?, createdAt }`.

### `GET /configs`

List all stored mocks (summary fields only).

### `GET /mock/:slug`

Serve the configured mock response. Matches the stored `path` exactly or any subpath under it. The request method must match the configured method.

Examples:

- Config path `/users/1` → `/mock/:slug`, `/mock/:slug/users/1`, `/mock/:slug/users/1/profile`

### `DELETE /configs/:slug`

Delete a mock by slug.

**Errors**

- `400` - Invalid config or slug
- `404` - Mock not found or no method/path match

## Run locally

```bash
cd apps/experiments/api-mock-server
npm install
npm run dev
```

Create a KV namespace and update `wrangler.json` before deploying.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/api-mock-server)

## Cloudflare features used

- Workers
- Workers KV
