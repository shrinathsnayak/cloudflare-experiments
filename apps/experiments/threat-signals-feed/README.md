# Threat Signals Feed

Query Cloudflare Threat Signals for structured threat indicators from your account's feeds.

## Features

- **GET /indicators** - List threat indicators from Cloudflare Threat Signals
- Query parameters for filtering by type and pagination
- Returns indicators with article context and feed information
- No WAF rule builder; pure feed query

## API

### `GET /indicators`

| Query  | Required | Description                                      |
| ------ | -------- | ------------------------------------------------ |
| `limit` | No       | Number of indicators to return (default: 10)     |
| `type`  | No       | Filter by indicator type (e.g., DOMAIN, IP, HASH)|

**Example request**

```http
GET /indicators?limit=5&type=DOMAIN
```

**Example response**

```json
{
  "indicators": [
    {
      "id": "uuid-1",
      "article_id": "article-uuid",
      "article_title": "Malicious domain activity detected",
      "feed_display_name": "Threat Feed Alpha",
      "type": "DOMAIN",
      "value": "evil.example.com"
    }
  ],
  "count": 5,
  "hasMore": true
}
```

**Errors**

- `500` - Missing Cloudflare credentials
- `502` - Threat Signals API error

## Configuration

Set environment variables in `wrangler.json` or via the dashboard:

```json
{
  "vars": {
    "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
    "CLOUDFLARE_API_TOKEN": "your-api-token"
  }
}
```

The API token needs access to Cloudflare Threat Signals for your account.

## Run locally

```bash
cd apps/experiments/threat-signals-feed
npm install
npm run dev
```

Then open: `http://localhost:8787/indicators`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/threat-signals-feed)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- [Threat Signals API](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_signals/)
- Cloudforce One threat intelligence indicators
