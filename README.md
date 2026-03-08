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
├── experiments/
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

Each experiment is **fully independent** and includes its own `README.md`, `wrangler.json`, `package.json`, and `src/`. Each can be deployed individually.

---

## Experiments

| Experiment | Description | Deploy |
|------------|-------------|--------|
| [AI Website Summary](experiments/ai-website-summary/) | Summarize any webpage using Workers AI | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/ai-website-summary) |
| [Screenshot API](experiments/screenshot-api/) | Capture screenshots of any website from the edge (Browser Rendering) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/screenshot-api) |
| [GitHub Repo Explainer](experiments/github-repo-explainer/) | AI explanation of any GitHub repository from README and key files | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/github-repo-explainer) |
| [Tech Stack Detector](experiments/tech-stack-detector/) | Detect technologies used by a website | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/tech-stack-detector) |
| [Dependency Analyzer](experiments/dependency-analyzer/) | Analyze all external resources (scripts, styles, fonts, images) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/dependency-analyzer) |
| [Is It Down](experiments/is-it-down/) | Check if a website is reachable from Cloudflare's edge | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/is-it-down) |
| [Website Metadata Extractor](experiments/website-metadata-extractor/) | Extract title, description, Open Graph, canonical from any page | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-metadata-extractor) |
| [Global Latency Tester](experiments/global-latency-tester/) | Measure response time from the edge (and by colo) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/global-latency-tester) |
| [Global API Tester](experiments/global-api-tester/) | Test API endpoints from Cloudflare's global edge | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/global-api-tester) |
| [Website DevTools Inspector](experiments/website-devtools-inspector/) | DevTools-style inspection: headers, cookies, scripts, assets | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-devtools-inspector) |
| [Website to API](experiments/website-to-api/) | Turn any webpage into structured JSON (title, headings, links, images) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-to-api) |
| [URL DNS Lookup](experiments/url-dns-lookup/) | Get all DNS records (A, AAAA, MX, NS, TXT, etc.) for any URL's hostname | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/url-dns-lookup) |
| [Website to llms.txt](experiments/website-to-llms-txt/) | Convert any webpage into llms.txt format for LLM consumption | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-to-llms-txt) |
| [AI Bot Visibility](experiments/ai-bot-visibility/) | Check if a URL is configured to be visible or blocked for AI crawlers (robots.txt + meta) | [Deploy](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/ai-bot-visibility) |

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

---

## Key Features

- **Independent deployments**: Every experiment includes a Cloudflare Deploy Button; deploy a single experiment without touching the others.
- **Stateless first**: Most experiments use edge compute, fetch, and HTML parsing—no persistent storage.
- **Single responsibility**: Each experiment demonstrates one specific Cloudflare capability.

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
