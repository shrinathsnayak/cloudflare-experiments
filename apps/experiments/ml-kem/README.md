# ML-KEM

Post-quantum key encapsulation with ML-KEM-768 using Web Crypto at the edge.

## Features

- **GET /keygen** - Generate an ML-KEM-768 key pair, encapsulate to a ciphertext, and decapsulate to verify the shared secret matches.
- Uses the `webcrypto_modern_algorithms` compatibility flag.
- No persistent storage; each request generates a fresh key pair.
- Runs on the edge in under 60 seconds.

## API

### `GET /keygen`

No query parameters required.

**Example**

```http
GET /keygen
```

**Response**

```json
{
  "algorithm": "ML-KEM-768",
  "publicKey": "a1b2c3...",
  "ciphertext": "d4e5f6...",
  "encapsulatedSecret": "g7h8i9...",
  "decapsulatedSecret": "g7h8i9...",
  "secretsMatch": true,
  "publicKeyLength": 1184,
  "ciphertextLength": 1088,
  "sharedSecretLength": 32
}
```

The `encapsulatedSecret` and `decapsulatedSecret` are truncated in the response for readability; the full values match when `secretsMatch` is `true`.

## Run locally

```bash
cd apps/experiments/ml-kem
npm install
npm run dev
```

Then open: `http://localhost:8787/keygen`

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/ml-kem)

Deploy from [shrinathsnayak/cloudflare-experiments](https://github.com/shrinathsnayak/cloudflare-experiments); fork and change the owner in the URL to use your own repo.

## Cloudflare features used

- Workers
- Web Crypto API (ML-KEM-768 with `webcrypto_modern_algorithms` flag)
- Edge computing
