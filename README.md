# Cloudflare Experiments

A curated collection of experiments demonstrating what developers can build using the **Cloudflare platform**.

📖 **Documentation:** [cloudflare-experiments.com](https://cloudflare-experiments.com) · source in [`apps/docs/`](apps/docs/) (Fumadocs + Next.js)

The goal of this repository is to showcase **real-world developer tools and utilities** that run entirely on the **Cloudflare edge**, often without requiring any backend servers or persistent storage.

Each experiment is:

- Small and focused
- Independently deployable
- Easy to understand
- Designed to run in under 60 seconds
- Deployable with **Click-to-Deploy on Cloudflare**

---

## Philosophy

Most Cloudflare tutorials show very simple examples (Hello World, simple KV counters, basic fetch). This repository focuses instead on **real tools developers would actually want to use**.

Every experiment demonstrates **practical capabilities of the Cloudflare platform**, including:

- Cloudflare Workers
- Workers AI
- Browser Rendering
- Edge networking
- HTMLRewriter
- Request/Response manipulation
- Global edge compute

---

## Repository Structure

```
cloudflare-experiments/
├── apps/
│   ├── docs/                    # Fumadocs documentation site
│   └── experiments/
│       ├── ai-website-summary/
│       ├── ai-website-tag-generator/
│       ├── screenshot-api/
│       ├── github-repo-explainer/
│       ├── dependency-analyzer/
│       ├── is-it-down/
│       ├── website-metadata-extractor/
│       ├── website-devtools-inspector/
│       ├── website-to-api/
│       ├── website-to-llms-txt/
│       ├── url-dns-lookup/
│       ├── ai-bot-visibility/
│       ├── cloud-ai-proxy/
│       ├── r2-storage/
│       ├── whereami/
│       ├── link-shortener/
│       └── edge-redirect-simulator/
├── turbo.json
├── .cursor/
│   ├── rules/
│   └── skills/
├── README.md
└── LICENSE
```

This is a **Turborepo** monorepo. Worker experiments live in `apps/experiments/`; the docs site lives in `apps/docs/`.

---

## Experiments

| Experiment                                                                 | Description                                                                               | Deploy                                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AI Website Summary](apps/experiments/ai-website-summary/)                 | Summarize any webpage using Workers AI                                                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-summary)         |
| [AI Website Tag Generator](apps/experiments/ai-website-tag-generator/)     | Generate topic tags for any website using Workers AI                                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-website-tag-generator)   |
| [Screenshot API](apps/experiments/screenshot-api/)                         | Capture screenshots of any website from the edge (Browser Rendering)                      | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/screenshot-api)             |
| [GitHub Repo Explainer](apps/experiments/github-repo-explainer/)           | AI explanation of any GitHub repository from README and key files                         | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/github-repo-explainer)      |
| [Dependency Analyzer](apps/experiments/dependency-analyzer/)               | Analyze all external resources (scripts, styles, fonts, images)                           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/dependency-analyzer)        |
| [Is It Down](apps/experiments/is-it-down/)                                 | Check if a website is reachable from Cloudflare's edge                                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/is-it-down)                 |
| [Website Metadata Extractor](apps/experiments/website-metadata-extractor/) | Extract title, description, Open Graph, canonical from any page                           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-metadata-extractor) |
| [Website DevTools Inspector](apps/experiments/website-devtools-inspector/) | DevTools-style inspection: headers, cookies, scripts, assets                              | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-devtools-inspector) |
| [Website to API](apps/experiments/website-to-api/)                         | Turn any webpage into structured JSON (title, headings, links, images)                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-to-api)             |
| [URL DNS Lookup](apps/experiments/url-dns-lookup/)                         | Get all DNS records (A, AAAA, MX, NS, TXT, etc.) for any URL's hostname                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/url-dns-lookup)             |
| [Website to llms.txt](apps/experiments/website-to-llms-txt/)               | Convert any webpage into llms.txt format for LLM consumption                              | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/website-to-llms-txt)        |
| [AI Bot Visibility](apps/experiments/ai-bot-visibility/)                   | Check if a URL is configured to be visible or blocked for AI crawlers (robots.txt + meta) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ai-bot-visibility)          |
| [Cloud AI Proxy](apps/experiments/cloud-ai-proxy/)                         | Call Workers AI with any model and prompt from a single public endpoint                   | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cloud-ai-proxy)             |
| [R2 Storage](apps/experiments/r2-storage/)                                 | R2 storage API with list/get/put/delete and configurable list options                     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/r2-storage)                 |
| [Where Am I](apps/experiments/whereami/)                                   | Request metadata from Cloudflare's edge (request.cf geolocation, colo)                    | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/whereami)                   |
| [Link Shortener](apps/experiments/link-shortener/)                         | Shorten URLs and redirect with D1 (POST /shorten, GET /:code)                             | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/link-shortener)             |
| [Edge Redirect Simulator](apps/experiments/edge-redirect-simulator/)       | Show redirect chains for any URL (each hop and status code)                               | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/edge-redirect-simulator)    |

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to submit **bug reports** and **pull requests**
- **Code and structure standards** (experiment layout, TypeScript, errors, validation)
- How to **propose or add a new experiment**
- **Testing**: Run `npm run test` from the repo root (Turborepo), or `npm run test` inside a single app.
- **Formatting**: From the repo root, run `npm run format` (Prettier) and `npm run lint` (ESLint). New apps must include test setup and follow the shared Prettier config.
- **Build all apps**: `npm run build` from the repo root.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Key Features

- **Independent deployments**: Every experiment includes a Cloudflare Deploy Button; deploy a single experiment without touching the others.
- **Stateless first**: Most experiments use edge compute, fetch, and HTML parsing—no persistent storage.
- **Single responsibility**: Each experiment demonstrates one specific Cloudflare capability.

---

## Future Experiments

Additional platform features that may be explored:

- Durable Objects
- Queues
- Images API
- Email Workers
- Vectorize

---

## License

MIT — see [LICENSE](LICENSE).
