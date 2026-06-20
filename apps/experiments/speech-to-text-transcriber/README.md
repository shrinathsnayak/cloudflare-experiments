# Speech to Text Transcriber

Upload audio and get a transcript using Workers AI Whisper (`@cf/openai/whisper-large-v3-turbo`).

## API

### `POST /transcribe`

Multipart form with field `audio` (max 2MB, `audio/*` types).

**Response:** `{ text, language?, durationMs }`

## Run locally

```bash
cd apps/experiments/speech-to-text-transcriber
npm install
npm run dev
```

```bash
curl -X POST http://localhost:8787/transcribe -F "audio=@sample.mp3"
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/speech-to-text-transcriber)

## Cloudflare features used

- Workers AI (Whisper)
