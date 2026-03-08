# AI That Explains Any GitHub Repository

Given a GitHub repo URL, the worker fetches its README and key files and generates a simple explanation using **Workers AI**.

## API

### `GET /repo`

| Query | Required | Description |
|-------|----------|-------------|
| `url` | Yes | GitHub repo URL (e.g. https://github.com/user/project) |

**Example**

```http
GET /repo?url=https://github.com/cloudflare/workers-sdk
```

**Response**

```json
{
  "summary": "A substantive paragraph describing the project, who it's for, and what problem it solves.",
  "mainTechnologies": ["React", "TypeScript", "Vite", "..."],
  "howItWorks": "Architecture and how to run/build, with concrete commands when available.",
  "keyFeatures": ["Feature one", "Feature two", "..."],
  "projectStructure": "Description of repo layout and important directories.",
  "gettingStarted": "Install, env setup, and main run/build steps.",
  "notableDependencies": ["package-name", "..."],
  "useCases": ["When to use this project", "..."]
}
```

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch GitHub or AI error.

## Run locally

```bash
cd experiments/github-repo-explainer
npm install
npm run dev
```

Then: `http://localhost:8787/repo?url=https://github.com/user/repo`

Requires a Cloudflare account with Workers AI enabled. GitHub API is used without auth (rate limits apply).

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/github-repo-explainer)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI
- Fetch (GitHub API)
