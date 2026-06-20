---
name: d1-sql-playground
description: Use when editing d1-sql-playground. POST /query with { sql }; read-only SELECT against seeded D1 tables (products, experiments); binding DB.
---

# D1 SQL Playground

- **Routes**: `POST /query` (body `{ sql }`); `GET /` (app info + allowed tables).
- **Response (query)**: `{ columns, rows, rowCount, durationMs }`.
- **Bindings**: D1 database (`DB`).
- **Validation**: `validateSelectSql` in `src/lib/sql.ts` — SELECT only, no semicolons/comments, allowed tables whitelist.
- **Utils**: `jsonError`, `jsonSuccess`; migrations in `migrations/0000_init.sql`.
