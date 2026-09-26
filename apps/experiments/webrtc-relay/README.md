# WebRTC Relay

Issue **Cloudflare Realtime TURN** credentials for WebRTC, with a demo fallback when secrets are not configured.

## API

### `GET /turn-credentials?ttl=`

### `GET /ice-servers?ttl=`

Both routes return the same shape.

| Param | Required | Description                                              |
| ----- | -------- | -------------------------------------------------------- |
| `ttl` | No       | Credential lifetime in seconds (60–86400, default 86400) |

**Demo mode** (missing `REALTIME_APP_ID` or `TURN_API_TOKEN`):

```json
{
  "iceServers": [
    {
      "urls": ["turn:turn.cloudflare.com:3478?transport=udp"],
      "username": "demo",
      "credential": "demo"
    }
  ],
  "ttl": 86400,
  "mode": "demo",
  "note": "Configure REALTIME_APP_ID and TURN_API_TOKEN for real credentials"
}
```

**Live mode** calls:

`POST https://rtc.live.cloudflare.com/v1/turn/keys/${REALTIME_APP_ID}/credentials/generate-ice-servers`

with `Authorization: Bearer ${TURN_API_TOKEN}`.

## Configuration

1. Set the TURN key id in `wrangler.json` `vars.REALTIME_APP_ID`, or:

```bash
npx wrangler secret put TURN_API_TOKEN
```

2. Optionally set `REALTIME_APP_ID` as a var or secret.

Create a TURN key in the [Cloudflare Realtime dashboard](https://developers.cloudflare.com/realtime/turn/).

## Run locally

```bash
cd apps/experiments/webrtc-relay
npm install
npm run dev
```

Without secrets, endpoints return demo credentials (safe for tests).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/webrtc-relay)

## Cloudflare features used

- Workers
- Cloudflare Realtime TURN
