# Clef Decision

Query Workers AI Clef or Clef-Flash models for decision probabilities.

## Features

- **POST /decision** - Pass a state description and questions (noul or choice type) to get probability distributions.
- Supports `@cf/cloudflare/clef` and `@cf/cloudflare/clef-flash` models.
- No persistent storage; stateless.
- Runs on the edge in under 60 seconds.

## API

### `POST /decision`

**Request body**

```json
{
  "state": "A short description of the current state",
  "questions": [
    {
      "type": "noul",
      "question": "Will it rain tomorrow?"
    },
    {
      "type": "choice",
      "question": "What color is the sky?",
      "choices": ["blue", "gray", "red"]
    }
  ],
  "model": "@cf/cloudflare/clef"
}
```

| Field       | Required | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `state`     | Yes      | Context or state description (string)               |
| `questions` | Yes      | Array of question objects (noul or choice)          |
| `model`     | No       | Model name (default: `@cf/cloudflare/clef`)         |

**Question types**

- `noul`: Binary question with yes/no probability.
- `choice`: Multiple-choice question with probability for each choice.

**Example**

```http
POST /decision
Content-Type: application/json

{
  "state": "The weather forecast shows clouds moving in.",
  "questions": [
    { "type": "noul", "question": "Will it rain?" },
    { "type": "choice", "question": "When?", "choices": ["today", "tomorrow", "next week"] }
  ]
}
```

**Response**

```json
{
  "model": "@cf/cloudflare/clef",
  "state": "The weather forecast shows clouds moving in.",
  "questions": [...],
  "answers": [
    { "type": "noul", "probability": 0.73 },
    { "type": "choice", "probabilities": [0.15, 0.65, 0.20] }
  ]
}
```

**Errors**

- `400` - Invalid JSON or missing required fields.
- `502` - Workers AI error.

## Run locally

```bash
cd apps/experiments/clef-decision
npm install
npm run dev
```

Then POST to: `http://localhost:8787/decision`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/clef-decision)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Workers AI (Clef decision API)
- AI binding
