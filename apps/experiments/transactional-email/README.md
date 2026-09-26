# Transactional Email

Send transactional email via the Cloudflare **Email Service** `send_email` binding.

## Setup

1. Onboard a sending domain: `npx wrangler email sending enable yourdomain.com`
2. Set `FROM_EMAIL` in `wrangler.json` `vars` to an address on that domain.
3. Optionally restrict destinations with `destination_address` on the binding.

## API

### `POST /send`

| Field     | Required | Description                        |
| --------- | -------- | ---------------------------------- |
| `to`      | Yes      | Recipient email                    |
| `subject` | Yes      | Subject line                       |
| `text`    | One of   | Plain-text body (text and/or html) |
| `html`    | One of   | HTML body (text and/or html)       |

**Example**

```http
POST /send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome",
  "text": "Thanks for signing up."
}
```

**Response**

```json
{ "sent": true, "to": "user@example.com", "subject": "Welcome", "messageId": "..." }
```

**Errors**

- `400` - `INVALID_TO`, `INVALID_SUBJECT`, `MISSING_BODY`, `INVALID_BODY`
- `502` - `SEND_ERROR`

## Run locally

```bash
cd apps/experiments/transactional-email
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/transactional-email)

## Cloudflare features used

- Email Sending (`send_email` binding)
