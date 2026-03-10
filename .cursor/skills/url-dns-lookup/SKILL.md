---
name: url-dns-lookup
description: Use when editing url-dns-lookup. GET /dns?url=; returns hostname and DNS records via DoH; no bindings.
---

# URL DNS Lookup

- **Route**: `GET /dns?url=`
- **Inputs**: `url` (required, http/https); hostname is extracted for lookup.
- **Outputs**: JSON with `hostname`, `records` (A, AAAA, CNAME, MX, NS, TXT, SOA, CAA).
- **Bindings**: None (Cloudflare DoH).
