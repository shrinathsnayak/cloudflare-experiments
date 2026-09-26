# DO SQLite Notes

Per-user notes stored in **SQLite-backed Durable Objects** via `sql.exec`. Each `userId` maps to its own Durable Object stub; notes live in a `notes` table.

## API

### `POST /notes`

Create or update a note.

**Body**

```json
{ "userId": "alice", "id": "n1", "content": "Hello" }
```

`userId` and `id` must be alphanumeric with `_` or `-`. Content max 4000 characters.

### `GET /notes?userId=&id=`

Fetch one note for a user.

### `GET /notes?userId=`

List all notes for a user.

### `DELETE /notes?userId=&id=`

Delete a note.

## Cloudflare features

- **Durable Objects** - `NotesDO` class, one stub per user
- **SQLite storage** - `new_sqlite_classes` migration and `storage.sql.exec`

## Run locally

```bash
cd apps/experiments/do-sqlite-notes
npm install
npm run dev
```

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/do-sqlite-notes)

## Tests

```bash
npm run test
```
