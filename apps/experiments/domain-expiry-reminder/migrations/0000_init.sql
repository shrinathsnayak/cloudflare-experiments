CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  alert_email TEXT NOT NULL,
  registration_expires_at TEXT,
  certificate_expires_at TEXT,
  last_checked_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('registration', 'certificate')),
  threshold_days INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  sent_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE (domain_id, kind, threshold_days, expires_at)
);
