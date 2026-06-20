# Cloudflare Experiments

A curated collection of **reference implementations** for building with **Cloudflare products and services**.

📖 **Documentation:** [cloudflare-experiments.com](https://cloudflare-experiments.com) · source in [`apps/docs/`](apps/docs/) (Fumadocs + Next.js)

The goal of this repository is to help developers **learn how to use Cloudflare platform features** by studying small, deployable examples. Each experiment maps to a specific product or capability - Workers AI, Durable Objects, Queues, D1, R2, Browser Rendering, and more.

Each experiment is:

- **Product-focused** - demonstrates one Cloudflare capability
- **Independently deployable** - clone or deploy a single example
- **Easy to understand** - minimal code, consistent structure
- **Designed to run in under 60 seconds**
- **Click-to-Deploy ready**

---

## Philosophy

Most Cloudflare tutorials show very simple examples (Hello World, basic KV counters, simple fetch). This repository focuses instead on **reference implementations you can copy when building with Cloudflare products**.

Every experiment demonstrates **one specific Cloudflare capability**, including:

- Cloudflare Workers
- Workers AI
- Browser Rendering
- Durable Objects
- Queues
- Cron Triggers
- D1 + KV
- R2
- HTMLRewriter
- Edge networking

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
│       ├── edge-redirect-simulator/
│       ├── durable-counter/
│       ├── cron-heartbeat/
│       └── task-queue/
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
| [Durable Counter](apps/experiments/durable-counter/)                       | Globally consistent counter using Durable Objects (reference pattern)                     | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/durable-counter)            |
| [Cron Heartbeat](apps/experiments/cron-heartbeat/)                         | Scheduled tasks with Cron Triggers; persists run metadata in KV                           | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/cron-heartbeat)             |
| [Task Queue](apps/experiments/task-queue/)                                 | Enqueue background tasks with Queues; async consumer with KV stats                        | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/task-queue)                 |

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
- **Product reference**: Each experiment teaches how to wire up a specific Cloudflare product or binding.
- **Single responsibility**: One experiment, one Cloudflare capability.

---

## Future Experiments

Additional platform features that may be explored:

- Vectorize
- Images API
- Email Workers
- Hyperdrive
- Workers Analytics Engine

---

## License

MIT - see [LICENSE](LICENSE).
