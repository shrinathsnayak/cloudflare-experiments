CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  allowed_origin TEXT,
  redirect_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id TEXT NOT NULL,
  fields TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id, created_at DESC);
