-- Sample products catalog for read-only SQL exploration
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Subset of Cloudflare Experiments from this repo
CREATE TABLE IF NOT EXISTS experiments (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO products (name, category, price, in_stock) VALUES
  ('Edge Cache Starter Kit', 'Platform', 29.99, 1),
  ('Workers AI Prompt Pack', 'AI', 49.99, 1),
  ('D1 Query Notebook', 'Storage', 19.99, 1),
  ('R2 Archive Box', 'Storage', 9.99, 1),
  ('Vectorize Search Lens', 'AI', 39.99, 0),
  ('Browser Rendering Frame', 'Browser', 59.99, 1),
  ('Durable Object Counter', 'Stateful', 24.99, 1),
  ('Cron Heartbeat Monitor', 'Stateful', 14.99, 1),
  ('WebSocket Echo Relay', 'Platform', 12.99, 1),
  ('Turnstile Verify Badge', 'Security', 4.99, 1);

INSERT INTO experiments (slug, name, category, description) VALUES
  ('is-it-down', 'Is It Down', 'Network & Monitoring', 'Check if a website is reachable from Cloudflare edge'),
  ('link-shortener', 'Link Shortener', 'Storage & Data', 'Shorten URLs and redirect with D1 and KV cache'),
  ('kv-notes', 'KV Notes', 'Storage & Data', 'Simple note storage with Workers KV at the edge'),
  ('durable-counter', 'Durable Counter', 'Stateful & Async', 'Globally consistent counter using Durable Objects'),
  ('cloud-ai-proxy', 'Cloud AI Proxy', 'AI & Machine Learning', 'Call Workers AI with any model and prompt'),
  ('vectorize-search', 'Vectorize Search', 'Storage & Data', 'Semantic search with Workers AI embeddings and Vectorize'),
  ('screenshot-api', 'Screenshot API', 'Browser Rendering', 'Capture screenshots using Browser Rendering'),
  ('edge-cache', 'Edge Cache', 'Edge Platform', 'Fetch URLs with the Workers Cache API'),
  ('task-queue', 'Task Queue', 'Stateful & Async', 'Enqueue background tasks with Cloudflare Queues'),
  ('crypto-hash', 'Crypto Hash', 'Edge Platform', 'Compute SHA digests with the Web Crypto API');
