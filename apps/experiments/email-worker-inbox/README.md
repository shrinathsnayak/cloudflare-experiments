# Email Worker Inbox

Receive inbound emails with **Cloudflare Email Workers**, parse them with `postal-mime`, store summaries in **KV**, and inspect them over HTTP.

## Features

- **`email` handler** - Parses inbound mail, rejects obvious spam, stores messages in KV
- **GET /inbox** - List recent messages (max 50)
- **GET /inbox/:id** - Fetch one stored message
- Local testing via Wrangler’s `/cdn-cgi/handler/email` endpoint

## Setup

1. Enable **Email Routing** for your zone in the Cloudflare dashboard.
2. Create a route that sends mail to this Worker.
3. Create a KV namespace and set its id in [`wrangler.json`](wrangler.json).

## API

### `GET /inbox`

Returns `{ count, messages[] }`.

### `GET /inbox/:id`

Returns a single stored message or `404 NOT_FOUND`.

## Local test

```bash
cd apps/experiments/email-worker-inbox
npm install
npm run dev
```

```bash
curl -X POST 'http://localhost:8787/cdn-cgi/handler/email?from=sender@example.com&to=inbox@example.com' \
  --data-binary @- <<'EOF'
From: sender@example.com
To: inbox@example.com
Subject: Testing Email Workers
Message-ID: <test@example.com>
Content-Type: text/plain

Hello from local email simulation.
EOF
```

Then:

```bash
curl http://localhost:8787/inbox
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/email-worker-inbox)

## Cloudflare features used

- Workers
- Email Workers / Email Routing
- Workers KV
