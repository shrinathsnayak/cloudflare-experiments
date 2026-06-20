CREATE TABLE IF NOT EXISTS tracked_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracked_url_id INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  diff_summary TEXT,
  r2_key TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tracked_url_id) REFERENCES tracked_urls(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_tracked_url_id ON snapshots(tracked_url_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(tracked_url_id, created_at DESC);
