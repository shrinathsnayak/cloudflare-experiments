# OAuth Provider v1

OAuth 2.1 provider demonstration with split authorization server and MCP resource server using `@cloudflare/workers-oauth-provider`.

## Features

- **Authorization Server**: `/oauth/authorize` and `/oauth/token` endpoints
- **MCP Resource Server**: `/mcp/tools` endpoint with OAuth token validation
- **Service Binding**: Resource server checks tokens via the authorization server
- **Step-up authorization**: `/mcp/admin` demonstrates `insufficientScope()` for privilege escalation
- Uses `@cloudflare/workers-oauth-provider` v1 split API

## API

### Authorization Endpoints

**`GET /oauth/authorize`** - Authorization endpoint for OAuth flow
**`POST /oauth/token`** - Token endpoint for exchanging codes

### Resource Server Endpoints

**`GET /mcp/tools`** - List MCP tools (requires `mcp:read` scope)

**`GET /mcp/admin`** - Admin endpoint (requires `mcp:write` scope, triggers step-up if insufficient)

## Configuration

Requires a KV namespace binding for OAuth state storage:

```json
{
  "kv_namespaces": [
    {
      "binding": "OAUTH_KV",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

## Run locally

```bash
cd apps/experiments/oauth-provider-v1
npm install
npm run dev
```

Then open: `http://localhost:8787/`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/oauth-provider-v1)

After deployment, create a KV namespace and bind it as `OAUTH_KV`.

## Cloudflare features used

- Workers
- [Workers OAuth Provider](https://www.npmjs.com/package/@cloudflare/workers-oauth-provider) (v0.10.3)
- KV (for OAuth state storage)
- Service Bindings (authorization server ↔ resource server)
- OAuth 2.1 with PKCE
