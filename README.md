# Cloudflare Experiments

A curated collection of experiments demonstrating what developers can build using the **Cloudflare platform**.

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
├── examples/
│   ├── ai-website-summary/
│   ├── screenshot-api/
│   ├── github-repo-explainer/
│   ├── tech-stack-detector/
│   ├── dependency-analyzer/
│   ├── is-it-down/
│   ├── website-metadata-extractor/
│   ├── global-latency-tester/
│   ├── global-api-tester/
│   ├── website-devtools-inspector/
│   ├── website-to-api/
│   ├── website-to-llms-txt/
│   ├── url-dns-lookup/
│   └── ai-bot-visibility/
├── .cursor/
│   ├── rules/
│   └── skills/
├── README.md
└── LICENSE
```

Each example is **fully independent** and includes its own `README.md`, `wrangler.json`, `package.json`, and `src/`. Each can be deployed individually.

---

## Experiments

| Experiment | Description | Deploy |
|------------|-------------|--------|
| [AI Website Summary](examples/ai-website-summary/) | Summarize any webpage using Workers AI | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/ai-website-summary) |
| [Screenshot API](examples/screenshot-api/) | Capture screenshots of any website from the edge (Browser Rendering) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/screenshot-api) |
| [GitHub Repo Explainer](examples/github-repo-explainer/) | AI explanation of any GitHub repository from README and key files | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/github-repo-explainer) |
| [Tech Stack Detector](examples/tech-stack-detector/) | Detect technologies used by a website | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/tech-stack-detector) |
| [Dependency Analyzer](examples/dependency-analyzer/) | Analyze all external resources (scripts, styles, fonts, images) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/dependency-analyzer) |
| [Is It Down](examples/is-it-down/) | Check if a website is reachable from Cloudflare's edge | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/is-it-down) |
| [Website Metadata Extractor](examples/website-metadata-extractor/) | Extract title, description, Open Graph, canonical from any page | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-metadata-extractor) |
| [Global Latency Tester](examples/global-latency-tester/) | Measure response time from the edge (and by colo) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/global-latency-tester) |
| [Global API Tester](examples/global-api-tester/) | Test API endpoints from Cloudflare's global edge | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/global-api-tester) |
| [Website DevTools Inspector](examples/website-devtools-inspector/) | DevTools-style inspection: headers, cookies, scripts, assets | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-devtools-inspector) |
| [Website to API](examples/website-to-api/) | Turn any webpage into structured JSON (title, headings, links, images) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-to-api) |
| [URL DNS Lookup](examples/url-dns-lookup/) | Get all DNS records (A, AAAA, MX, NS, TXT, etc.) for any URL's hostname | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/url-dns-lookup) |
| [Website to llms.txt](examples/website-to-llms-txt/) | Convert any webpage into llms.txt format for LLM consumption | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/website-to-llms-txt) |
| [AI Bot Visibility](examples/ai-bot-visibility/) | Check if a URL is configured to be visible or blocked for AI crawlers (robots.txt + meta) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/examples/ai-bot-visibility) |

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

---

## Key Features

- **Independent deployments**: Every example includes a Cloudflare Deploy Button; deploy a single experiment without touching the others.
- **Stateless first**: Most experiments use edge compute, fetch, and HTML parsing—no persistent storage.
- **Single responsibility**: Each example demonstrates one specific Cloudflare capability.

---

## Future Experiments

Additional platform features that may be explored:

- Durable Objects
- R2
- D1
- Queues
- Turnstile
- Images API
- Email Workers
- Vectorize

---

## License

MIT — see [LICENSE](LICENSE).
