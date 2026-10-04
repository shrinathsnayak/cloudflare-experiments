# Container Snapshot

Demonstrate Cloudflare Container filesystem snapshots using the `durable_object` scheduling policy.

## Features

- **GET /snapshot** - Start a container, write a file, create a snapshot, and save it
- **GET /restore** - Restore from the snapshot and verify the file persists
- Uses `durable_object` scheduling policy (required for snapshots)
- Demonstrates `snapshotContainer()` and restore via `containerSnapshot` parameter

## API

### `GET /snapshot`

Creates a container, writes a demo file, takes a snapshot, and stores it in Durable Object storage.

**Example**

```http
GET /snapshot
```

**Response**

```json
{
  "status": "snapshot_created",
  "snapshotId": "snapshot-abc123...",
  "fileCreated": true
}
```

### `GET /restore`

Restores the container from the saved snapshot and verifies the file is still there.

**Example**

```http
GET /restore
```

**Response**

```json
{
  "status": "snapshot_restored",
  "fileExists": true,
  "fileContent": "Hello from snapshot!"
}
```

## Configuration

This experiment requires:
1. A Durable Object binding
2. A Container application with `durable_object` scheduling policy
3. A configured image (uses `cloudflare/debian-trixie`)

## Run locally

```bash
cd apps/experiments/container-snapshot
npm install
npm run dev
```

Then:
1. Open `http://localhost:8787/snapshot` to create a snapshot
2. Open `http://localhost:8787/restore` to restore and verify

## Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shrinathsnayak/cloudflare-experiments/tree/main/apps/experiments/container-snapshot)

After deployment, the Durable Object and Container application are automatically configured.

## Cloudflare features used

- Workers
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Containers](https://developers.cloudflare.com/containers/)
- [Container Snapshots](https://developers.cloudflare.com/containers/guides/snapshots/) (durable_object policy)
- `snapshotContainer()` and restore via `containerSnapshot`
