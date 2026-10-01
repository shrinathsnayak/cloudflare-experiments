CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_address TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  link TEXT,
  received_at INTEGER NOT NULL DEFAULT (unixepoch()),
  digested_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_items_pending ON items(digested_at, received_at);
