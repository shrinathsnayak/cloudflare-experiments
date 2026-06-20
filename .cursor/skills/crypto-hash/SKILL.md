---
name: crypto-hash
description: Use when editing crypto-hash. GET /hash?text=; Web Crypto SHA digests.
---

# Crypto Hash

- **Route**: `GET /hash?text=<text>&algorithm=SHA-256`
- **Response**: `{ algorithm, hash, inputLength }`
- **Bindings**: None. Uses `crypto.subtle.digest`.
