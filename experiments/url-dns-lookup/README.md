# URL DNS Lookup

Get all DNS-related information for the hostname of any URL. Uses Cloudflare's DNS over HTTPS (DoH) to resolve A, AAAA, CNAME, MX, NS, TXT, SOA, and CAA records.

## Features

- **GET /dns?url=** — Pass a URL; returns the hostname and all resolved DNS records by type.
- Stateless; no bindings. Queries Cloudflare's public DoH API.
- Runs on the edge in under 60 seconds.

## API

### `GET /dns`

| Query | Required | Description                                                     |
| ----- | -------- | --------------------------------------------------------------- |
| `url` | Yes      | Any http or https URL. The hostname is extracted and looked up. |

**Example**

```http
GET /dns?url=https://www.cloudflare.com/page
```

**Response**

```json
{
  "hostname": "example.com",
  "records": {
    "A": [
      {
        "name": "example.com",
        "type": "A",
        "ttl": 1726,
        "data": "93.184.220.34"
      }
    ],
    "AAAA": [
      {
        "name": "example.com",
        "type": "AAAA",
        "ttl": 1726,
        "data": "2606:2800:220:1:248:1893:25c8:1946"
      }
    ],
    "NS": [
      {
        "name": "example.com",
        "type": "NS",
        "ttl": 172800,
        "data": "a.iana-servers.net."
      }
    ]
  }
}
```

Only record types that exist for the hostname are included. Each record has `name`, `type`, `ttl`, and `data`.

**Errors**

- `400` — Missing or invalid `url` (e.g. not http/https).
- `502` — DNS lookup failed (e.g. DoH timeout or error).

## Run locally

```bash
cd experiments/url-dns-lookup
npm install
npm run dev
```

Then open: `http://localhost:8787/dns?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/url-dns-lookup)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API (DoH)
- Edge networking
