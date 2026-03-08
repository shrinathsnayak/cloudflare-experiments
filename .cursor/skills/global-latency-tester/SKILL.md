---
name: global-latency-tester
description: Use when editing global-latency-tester. GET /latency?url=; returns latency and cf.colo.
---

# Global Latency Tester

- **Route**: `GET /latency?url=`
- **Outputs**: `latencyMs`, `colo`, `statusCode`. Read colo from (c.req.raw as any).cf?.colo.
