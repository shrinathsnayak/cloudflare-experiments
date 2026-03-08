# Convert Any Website to llms.txt

Turn a webpage into [llms.txt](https://www.ai-visibility.org.uk/specifications/llms-txt/)-style plain text so LLMs and AI systems can consume structured identity and key information (title, description, links, contact) without crawling the full site. Fetches the given URL’s HTML and extracts title, meta/og description, in-page links (Key Information), and mailto links (Contact).

## API

### `GET /llms.txt`

| Query | Required | Description                 |
| ----- | -------- | --------------------------- |
| `url` | Yes      | Webpage URL (http or https) |

**Example**

```http
GET /llms.txt?url=https://www.cloudflare.com
```

**Response**

`Content-Type: text/plain; charset=utf-8` — body is the generated llms.txt content:

```text
# Example Domain

> Example description from the page.

## Key Information

- [More information...](https://www.cloudflare.com/more)

## Contact

- Website: https://www.cloudflare.com
- Contact details were not found on this page.
```

The output follows the llms.txt convention: H1 (site/title), blockquote (description from meta/og), ## Key Information (links with text from the page), ## Contact (mailto links if present, otherwise a placeholder).

**Errors**

- `400` — Missing or invalid `url`.
- `502` — Failed to fetch the page.

## Run locally

```bash
cd experiments/website-to-llms-txt
npm install
npm run dev
```

Then: `http://localhost:8787/llms.txt?url=https://www.cloudflare.com`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/experiments/website-to-llms-txt)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Fetch API
- HTML parsing (regex-based)
