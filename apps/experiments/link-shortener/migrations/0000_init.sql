-- Links: short code -> long URL
CREATE TABLE IF NOT EXISTS links (
  code TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
