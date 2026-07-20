-- ShotOG Database Schema
-- API keys, usage tracking, and templates

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'Default',
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK(tier IN ('free', 'starter', 'pro', 'scale')),
  monthly_limit INTEGER NOT NULL DEFAULT 500,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Usage tracking (per-day aggregation)
CREATE TABLE IF NOT EXISTS usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key_id TEXT NOT NULL REFERENCES api_keys(id),
  date TEXT NOT NULL,
  requests_count INTEGER NOT NULL DEFAULT 0,
  cached_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(api_key_id, date)
);

-- Index for fast usage lookups
CREATE INDEX IF NOT EXISTS idx_usage_key_date ON usage(api_key_id, date);

-- Pre-seed a demo API key for testing (key: shotog_demo_key_2026)
INSERT OR IGNORE INTO api_keys (id, key_hash, name, email, tier, monthly_limit)
VALUES (
  'demo-001',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'Demo Key',
  'demo@shotog.com',
  'free',
  500
);
