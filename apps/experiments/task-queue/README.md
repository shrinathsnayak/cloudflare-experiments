# Task Queue

Reference implementation for **Queues** - enqueue tasks over HTTP and process them asynchronously in a `queue()` consumer.

Use this experiment when you need to decouple request handling from background work (email sending, webhooks, data processing, retries).

## API

### `POST /enqueue`

**Body**

```json
{ "message": "sync analytics" }
```

**Response**

```json
{
  "queued": true,
  "message": "sync analytics",
  "enqueuedAt": "2025-06-20T12:00:00.000Z"
}
```

### `GET /stats`

Returns enqueue and process counts stored in KV.

```json
{
  "enqueued": 10,
  "processed": 8
}
```

## Queue consumer

The `queue()` handler in `src/index.ts` processes batches from the `task-queue` queue and increments the `processed` counter.

## Cloudflare features

- **Queues** - producer (`TASK_QUEUE.send`) and consumer (`queue()` handler)
- **Workers KV** - tracks enqueue/process stats

## Run locally

```bash
cd apps/experiments/task-queue
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/task-queue)

Create the queue and KV namespace in your Cloudflare account before deploying.

## Tests

```bash
npm run test
```
