# Static Form Backend

A contact-form backend for static sites. Point any `<form action>` at `POST /f/:formId` and the Worker verifies **Turnstile**, drops honeypot spam, applies the native **Rate Limiting** binding per client IP, stores the submission in **D1** (with a hashed IP, never the raw one), and emails the form owner via **Email Sending**.

## API

| Method | Path                     | Auth                 | Description                                                    |
| ------ | ------------------------ | -------------------- | -------------------------------------------------------------- |
| `POST` | `/forms`                 | `Bearer ADMIN_TOKEN` | Create a form (`{ ownerEmail, allowedOrigin?, redirectUrl? }`) |
| `POST` | `/f/:formId`             | public               | Submit (urlencoded, multipart text fields, or JSON)            |
| `GET`  | `/forms/:id/submissions` | `Bearer ADMIN_TOKEN` | Latest 50 submissions                                          |

Submission rules:

- Max **30** fields, **5000** characters per value; file uploads are ignored
- `_gotcha` (honeypot): if non-empty, the request gets a normal success reply but nothing is stored or emailed
- `cf-turnstile-response`: verified with siteverify when `TURNSTILE_SECRET_KEY` is set. **When the secret is missing, verification is skipped and responses include `"turnstile": "skipped"` — use that for local development only.**
- `allowedOrigin` set → requests with a different `Origin` header get `403 ORIGIN_NOT_ALLOWED`
- `Accept: text/html` (normal browser form posts) + `redirectUrl` → `303` redirect; otherwise JSON

### Example

```bash
curl -X POST "$WORKER/forms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"ownerEmail":"me@example.com","allowedOrigin":"https://mysite.com","redirectUrl":"https://mysite.com/thanks"}'
# → { "id": "3f9c...", "endpoint": "https://.../f/3f9c...", ... }

curl -X POST "$WORKER/f/3f9c..." \
  -H "Origin: https://mysite.com" \
  -d "name=Ada&email=ada@example.com&message=Hello"
```

## Wire it into a static site

See [`examples/contact.html`](examples/contact.html): a plain HTML form with the Turnstile widget, a hidden `_gotcha` honeypot, and an optional `fetch()` enhancement. Works with any static host (Pages, GitHub Pages, Netlify, S3).

## Bindings and secrets

- `DB` (D1) — `forms` and `submissions` (`migrations/0000_init.sql`)
- `EMAIL` (`send_email`) — owner notifications; `FROM_EMAIL` var must be on an onboarded domain
- `FORM_RATE_LIMITER` (Rate Limiting) — 5 submissions per 60s per IP
- Secrets: `ADMIN_TOKEN` (required for admin routes), `TURNSTILE_SECRET_KEY` (required in production), `IP_HASH_SALT` (optional, recommended)

## Local development

```bash
npm install
npx wrangler d1 migrations apply static-form-backend-db --local
echo 'ADMIN_TOKEN=dev-token' > .dev.vars
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/static-form-backend)

After deploy:

```bash
npx wrangler d1 migrations apply static-form-backend-db --remote
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put IP_HASH_SALT
npx wrangler email sending enable yourdomain.com
```
