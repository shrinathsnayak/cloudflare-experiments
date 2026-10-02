# Article to Audio

"Listen to this article" for any URL. The Worker fetches the page, extracts readable text with **HTMLRewriter**, synthesizes speech with **Workers AI** Deepgram Aura-2 (`@cf/deepgram/aura-2-en` / `@cf/deepgram/aura-2-es`), and caches the MP3 in **R2** so repeat requests are instant.

## API

### `GET /listen`

| Query  | Required | Description                          |
| ------ | -------- | ------------------------------------ |
| `url`  | Yes      | Article URL (http or https)          |
| `lang` | No       | `en` (default) or `es` — picks model |

Returns `audio/mpeg` with `X-Cache: HIT` (served from R2) or `MISS` (synthesized now).

```bash
curl -o article.mp3 "http://localhost:8787/listen?url=https://blog.cloudflare.com/markdown-for-agents/"
```

Or drop it straight into a page:

```html
<audio controls src="https://your-worker.workers.dev/listen?url=https://example.com/post"></audio>
```

### `GET /text`

Debug view of what would be spoken.

```json
{
  "url": "https://blog.cloudflare.com/markdown-for-agents/",
  "title": "Introducing Markdown for Agents | Cloudflare Blog",
  "text": "Introducing Markdown for Agents. Celso Martinho and Will Allen ...",
  "chars": 5433,
  "chunks": 6,
  "truncated": true
}
```

**Errors**

- `400` - `INVALID_URL`, `INVALID_LANG`, `NO_CONTENT` (URL is not an HTML page)
- `404` - `NO_CONTENT` (no readable article text found)
- `502` - `FETCH_ERROR` (page fetch failed), `TTS_ERROR` (speech synthesis failed)

## How it works

1. **Extract** - HTMLRewriter streams the page, collecting `<p>` and `<h1>`–`<h3>` text; content inside `<article>`/`<main>` wins, and `nav`, `footer`, `aside`, `script`, `style` (and similar) are skipped.
2. **Chunk** - Text is split on sentence boundaries (`Intl.Segmenter`) into up to 6 chunks of ≤1,000 characters (Aura's limit is 2,000).
3. **Synthesize** - Chunks run through Aura-2 in parallel; the raw MP3 frames are concatenated in order.
4. **Cache** - The MP3 is stored in R2 under `audio/<sha256(model, lang, url)>.mp3`.

## Run locally

```bash
cd apps/experiments/article-to-audio
npm install
npm run dev
```

R2 is simulated locally; the `AI` binding always runs remotely, so you need a logged-in Wrangler session.

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/article-to-audio)

The deploy flow provisions the `article-to-audio-cache` R2 bucket from `wrangler.json`. To deploy manually, create it first: `npx wrangler r2 bucket create article-to-audio-cache`.

## Cloudflare features used

- Workers + HTMLRewriter
- Workers AI text-to-speech (`@cf/deepgram/aura-2-en`, `@cf/deepgram/aura-2-es`)
- R2 (`AUDIO_CACHE`)
