---
name: task-queue
description: Use when editing task-queue. POST /enqueue, GET /stats; Queues producer/consumer; KV stats.
---

# Task Queue

- **Routes**: `POST /enqueue` (body `{ message }`), `GET /stats`
- **Response (enqueue)**: `{ queued, message, enqueuedAt }`
- **Response (stats)**: `{ enqueued, processed }`
- **Bindings**: Queue `TASK_QUEUE`, KV `STATS`
- **Consumer**: `queue()` handler acks messages and increments `processed`
