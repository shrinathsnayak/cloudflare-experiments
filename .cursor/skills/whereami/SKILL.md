---
name: whereami
description: Use when editing whereami. GET /whereami returns request.cf (country, city, colo, etc.); no bindings.
---

# Where Am I

- **Route**: `GET /whereami`
- **Inputs**: None (uses incoming request).
- **Outputs**: JSON from `request.cf` (country, city, region, timezone, colo, asn).
- **Bindings**: None.
