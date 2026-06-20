---
name: cron-heartbeat
description: Use when editing cron-heartbeat. GET /status; Cron Triggers scheduled handler; KV run metadata.
---

# Cron Heartbeat

- **Route**: `GET /status`
- **Response**: `{ lastRun, lastCron, runCount }`
- **Bindings**: KV namespace `STATUS`
- **Scheduled**: `*/5 * * * *` cron updates KV via `scheduled()` handler
