# KV Notes

Simple note storage with **Workers KV**.

## API

### `POST /notes`

| Field     | Required | Description                          |
| --------- | -------- | ------------------------------------ |
| `id`      | Yes      | Note id (letters, numbers, `_`, `-`) |
| `content` | Yes      | Note body (max 4,000 characters)     |

**Example**

```http
POST /notes
Content-Type: application/json

{ "id": "todo-1", "content": "Ship the experiment" }
```

### `GET /notes?id=`

Returns `{ id, content, updatedAt }`.

### `DELETE /notes?id=`

Deletes a note and returns `{ id, deleted: true }`.

**Errors**

- `400` - Invalid id or content
- `404` - Note not found

## Run locally

```bash
cd apps/experiments/kv-notes
npm install
npm run dev
```

Create a KV namespace and update `wrangler.json` before deploying.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/kv-notes)

## Cloudflare features used

- Workers
- Workers KV
