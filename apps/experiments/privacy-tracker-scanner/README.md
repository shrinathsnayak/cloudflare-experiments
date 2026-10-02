# Privacy Tracker Scanner

Load a page in **Cloudflare Browser Rendering** exactly as a first-time visitor would — **without clicking any consent banner** — and report which third-party trackers fire and which cookies get set.

## API

### `GET /scan`

| Query | Required | Description              |
| ----- | -------- | ------------------------ |
| `url` | Yes      | Page URL (http or https) |

```http
GET /scan?url=https://www.cnn.com
```

```json
{
  "url": "https://www.cnn.com/",
  "finalUrl": "https://www.cnn.com/",
  "firstPartyDomain": "cnn.com",
  "timedOut": true,
  "requests": { "total": 336, "thirdParty": 250 },
  "thirdPartyDomains": [
    {
      "domain": "securepubads.g.doubleclick.net",
      "requests": 9,
      "tracker": { "name": "Google DoubleClick", "category": "advertising" }
    },
    { "domain": "media.cnn.com", "requests": 1 }
  ],
  "trackers": [
    {
      "name": "Google DoubleClick",
      "category": "advertising",
      "domains": ["securepubads.g.doubleclick.net"],
      "requests": 15
    }
  ],
  "cookies": {
    "firstParty": 57,
    "thirdParty": 3,
    "list": [
      {
        "name": "IDE",
        "domain": ".doubleclick.net",
        "expires": "2027-10-26T12:00:00.000Z",
        "secure": true,
        "httpOnly": true,
        "sameSite": "None",
        "thirdParty": true
      }
    ]
  },
  "verdict": "heavy-tracking"
}
```

- **Third party** = the request host's registrable domain (eTLD+1 heuristic, handles `co.uk`, `com.au`, …) differs from the final page URL's.
- **Trackers** come from a built-in list in `src/constants/trackers.ts` (Google Analytics/Tag Manager/DoubleClick, Facebook Pixel, Hotjar, Microsoft Clarity, Segment, Mixpanel, TikTok, LinkedIn Insight, Criteo, …) with categories `analytics`, `advertising`, `social`, `session-replay`.
- **Cookies** are read from the whole browser jar via CDP `Network.getAllCookies` (all frames and domains). `expires` is `null` for session cookies.
- **Verdict**: `clean` (no known trackers), `some-trackers`, or `heavy-tracking` (≥ 5 distinct trackers or ≥ 10 third-party cookies).
- Navigation waits for `networkidle2` up to 15 s. Pages that never go idle return what loaded so far with `timedOut: true`.

### Errors

| Status | Code            | When                             |
| ------ | --------------- | -------------------------------- |
| 400    | `INVALID_URL`   | Missing or invalid `url`         |
| 502    | `BROWSER_ERROR` | Browser launch/navigation failed |

## Run locally

```bash
cd apps/experiments/privacy-tracker-scanner
npm install
npm run dev
```

`http://localhost:8787/scan?url=https://example.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/privacy-tracker-scanner)

Requires Browser Rendering on your account.

## Cloudflare features used

- Workers
- Browser Rendering (`@cloudflare/puppeteer` request interception events + CDP session)
