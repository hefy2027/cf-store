-- Baseline schema (replaces historical 0001–0019). New databases only via wrangler apply.
-- Column order: identity → main fields → metadata / upstream linkage → timestamps.
-- Existing DBs that already applied the old chain: register this file in d1_migrations without executing; see docs/ops-d1-baseline-migration.md

-- Gateway-owned users (budget lives here; api_keys.user_id → users.id)
-- 唯一约束（语义层面两组）：
--   1) (external_system, external_user_id) — 多上游幂等。二者须同空或同非空。
--   2) (external_system, email)            — 同一上游内 email 唯一；internal 用户
--      （external_system IS NULL）作为单独 namespace，email 在 internal 用户之间
--      也唯一。SQLite/D1 在普通 UNIQUE 中视 NULL 互不相等，故拆为两条 partial
--      unique index 实现。
-- email 必填；external_system 若设则不可为空字符串（保持 namespace 边界清晰）。
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  budget_max REAL DEFAULT NULL,
  budget_base REAL NOT NULL DEFAULT 0,
  budget_spent REAL NOT NULL DEFAULT 0,
  budget_period TEXT NOT NULL DEFAULT 'none',
  budget_reset_at TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  metadata TEXT DEFAULT NULL,
  external_system TEXT,
  external_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    (external_system IS NULL AND external_user_id IS NULL)
    OR (external_system IS NOT NULL AND external_user_id IS NOT NULL)
  ),
  CHECK (external_system IS NULL OR length(external_system) > 0)
);

CREATE UNIQUE INDEX uk_users_external_system_user_id ON users(external_system, external_user_id);
CREATE UNIQUE INDEX uk_users_external_system_email
  ON users(external_system, email)
  WHERE external_system IS NOT NULL;
CREATE UNIQUE INDEX uk_users_internal_email
  ON users(email)
  WHERE external_system IS NULL;

-- API keys (no budget columns; belong to users)
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  metadata TEXT DEFAULT NULL,
  last_used_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Upstream providers
CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  base_url_openai TEXT,
  base_url_anthropic TEXT,
  base_url_gemini TEXT,
  description TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Models (tags in model_tags)
CREATE TABLE models (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  vendor TEXT NOT NULL DEFAULT 'other',
  context_window INTEGER,
  max_tokens INTEGER DEFAULT 8192,
  /* pricing_profile: TEXT JSON — 模型标准价/阶梯（canonical { tiers }；列价真源） */
  pricing_profile TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE model_tags (
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (model_id, tag)
);

CREATE TABLE model_routes (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id),
  provider_id TEXT NOT NULL REFERENCES providers(id),
  provider_model_name TEXT NOT NULL,
  upstream_protocol TEXT NOT NULL DEFAULT 'openai',
  route_group TEXT NOT NULL DEFAULT 'default',
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  price_override TEXT DEFAULT NULL,
  custom_params TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE api_key_request_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  api_key_id TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  user_email TEXT,
  model_id TEXT,
  model_name TEXT,
  provider_id TEXT,
  provider_name TEXT,
  provider_model_name TEXT,
  request_body TEXT,
  upstream_request_body TEXT DEFAULT NULL,
  request_protocol TEXT NOT NULL DEFAULT 'openai',
  upstream_protocol TEXT NOT NULL DEFAULT 'openai',
  route_group TEXT NOT NULL DEFAULT 'default',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  reasoning_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  standard_cost REAL NOT NULL DEFAULT 0,
  metered_cost REAL NOT NULL DEFAULT 0,
  charged_cost REAL NOT NULL DEFAULT 0,
  status TEXT,
  latency_ms INTEGER,
  error_message TEXT,
  raw_usage TEXT DEFAULT NULL,
  /* pricing_audit: TEXT，存 JSON 字符串。结构约定见 packages/core/src/db/pricing-audit.ts
     v1 含: v, basis_tokens?, tier?, snapshot? — 演进时加键或升 v，避免再加列 */
  pricing_audit TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- User-scoped audit trail (budget, profile, etc.; optional api_key_id for attribution)
-- user_id 可空：用户物理删除后外键 ON DELETE SET NULL，审计行保留（身份见快照 / change_payload）
CREATE TABLE user_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  api_key_id TEXT REFERENCES api_keys(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'system',
  request_log_id TEXT DEFAULT NULL,
  /* 扩展 JSON：预算周期前后值、管理端 patch 摘要等（原 metadata） */
  change_payload TEXT DEFAULT NULL,
  /* Full-row JSON snapshots + changed field names（见 user-audit-snapshot.ts） */
  before_user_snapshot TEXT DEFAULT NULL,
  after_user_snapshot TEXT DEFAULT NULL,
  changed_fields TEXT DEFAULT NULL,
  correlation_id TEXT DEFAULT NULL,
  source TEXT DEFAULT NULL,
  actor_id TEXT DEFAULT NULL,
  reason_code TEXT DEFAULT NULL,
  reason_text TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
-- 注：(external_system, email) 与 (email WHERE external_system IS NULL) 已在表
-- 定义处加 partial UNIQUE；此处仍保留按 email 单列查询的非唯一索引。
CREATE INDEX idx_users_external_system ON users(external_system);
CREATE INDEX idx_users_external_user_id ON users(external_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_status ON api_keys(status);

CREATE INDEX idx_api_key_request_logs_created ON api_key_request_logs(created_at);
CREATE INDEX idx_api_key_request_logs_user_created ON api_key_request_logs(user_id, created_at);
CREATE INDEX idx_api_key_request_logs_key_created ON api_key_request_logs(api_key_id, created_at);
CREATE INDEX idx_api_key_request_logs_key_status ON api_key_request_logs(api_key_id, status);
CREATE INDEX idx_api_key_request_logs_key_charged_created ON api_key_request_logs(api_key_id, charged_cost, created_at);
CREATE INDEX idx_api_key_request_logs_user_charged_created ON api_key_request_logs(user_id, charged_cost, created_at);
CREATE INDEX idx_api_key_request_logs_model_created ON api_key_request_logs(model_id, created_at);
CREATE INDEX idx_api_key_request_logs_user_email_created ON api_key_request_logs(user_email, created_at);
CREATE INDEX idx_api_key_request_logs_status_created ON api_key_request_logs(status, created_at);

CREATE INDEX idx_model_routes_model_status_group_priority
  ON model_routes(model_id, status, route_group, priority);

CREATE INDEX idx_user_audit_user_created
  ON user_audit_logs(user_id, created_at);
CREATE INDEX idx_user_audit_key_created
  ON user_audit_logs(api_key_id, created_at);
CREATE INDEX idx_user_audit_event_created
  ON user_audit_logs(event_type, created_at);
CREATE INDEX idx_user_audit_request_log
  ON user_audit_logs(request_log_id);
CREATE INDEX idx_user_audit_correlation
  ON user_audit_logs(correlation_id);
CREATE INDEX idx_user_audit_source_created
  ON user_audit_logs(source, created_at);
CREATE INDEX idx_user_audit_reason_created
  ON user_audit_logs(reason_code, created_at);
-- Optional dev/demo seed (idempotent). Requires 0001_baseline.sql applied.
-- Single source of truth for default keys/values: keep aligned with Postgres `migrations-postgres/0002_seed.sql`.

INSERT INTO system_config (key, value, description) VALUES
  (
    'MASTER_KEY',
    'sk-dev-admin-key',
    'Bearer token for Gateway admin API. Set in Admin Config.'
  ),
  (
    'BUSINESS_TIMEZONE',
    'UTC',
    'IANA timezone for day-boundary logic (today stats)'
  ),
  (
    'BILLING_CURRENCY',
    'USD',
    'ISO 4217 alphabetic code for pricing_profile and user budget amounts (per-million-token unit).'
  )
ON CONFLICT(key) DO UPDATE SET
  value = CASE
    WHEN system_config.key = 'MASTER_KEY' THEN system_config.value
    ELSE excluded.value
  END,
  description = excluded.description;
-- Add model modalities and release date columns (aligned with Postgres/MySQL 0003).

ALTER TABLE models ADD COLUMN input_modalities TEXT DEFAULT NULL;
ALTER TABLE models ADD COLUMN output_modalities TEXT DEFAULT NULL;
ALTER TABLE models ADD COLUMN released_at TEXT DEFAULT NULL;
-- Provider API key pool: multiple upstream credentials per provider.
CREATE TABLE provider_api_keys (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  api_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  weight INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_provider_api_keys_provider_id ON provider_api_keys(provider_id);
CREATE INDEX idx_provider_api_keys_provider_active ON provider_api_keys(provider_id, status, priority DESC);

INSERT INTO provider_api_keys (id, provider_id, label, api_key, status, weight, priority)
SELECT
  'pkey_' || id,
  id,
  'default',
  api_key,
  'active',
  1,
  0
FROM providers;

ALTER TABLE api_key_request_logs ADD COLUMN provider_key_id TEXT DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN provider_key_label TEXT DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN provider_key_fingerprint TEXT DEFAULT NULL;
-- Retire legacy single-key column; keys live in provider_api_keys only.
-- Apply after code that no longer reads/writes providers.api_key is deployed.
ALTER TABLE providers DROP COLUMN api_key;
-- Upstream trace ids on api_key_request_logs (two semantics):
--   upstream_request_id  — HTTP response header (x-request-id, request-id, x-ws-request-id, …)
--   upstream_message_id  — response body object id (chatcmpl-*, msg_*, responseId)
ALTER TABLE api_key_request_logs ADD COLUMN upstream_request_id TEXT DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN upstream_message_id TEXT DEFAULT NULL;
-- Runtime scheduling configs (both JSON, NULL = feature off / unlimited):
--   provider_api_keys.limit_config — per-key rate limits, e.g. {"rpm":500,"tpm":200000,"max_concurrency":32}
--   models.sticky_config           — sticky key routing rules keyed by "{protocol}:{route_group}"
ALTER TABLE provider_api_keys ADD COLUMN limit_config TEXT DEFAULT NULL;
ALTER TABLE models ADD COLUMN sticky_config TEXT DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN gateway_overhead_ms INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN upstream_response_ms INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN final_upstream_headers_ms INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN first_token_ms INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN stream_duration_ms INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN upstream_attempt_count INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN upstream_failover_count INTEGER DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN timing_metadata TEXT DEFAULT NULL;
ALTER TABLE api_key_request_logs ADD COLUMN first_reasoning_token_ms INTEGER DEFAULT NULL;
-- D1 baseline already allows NULL on models.max_tokens (INTEGER DEFAULT 8192, no NOT NULL).
-- Keep a no-op migration so version numbers stay aligned across drivers.
SELECT 1;
-- Phase 1: add providers.endpoints JSON; backfill from base_url_*; keep legacy columns.
ALTER TABLE providers ADD COLUMN endpoints TEXT;

UPDATE providers
SET endpoints = nullif(
	json_patch(
		'{}',
		json_object(
			'openai',
			CASE
				WHEN base_url_openai IS NOT NULL AND length(trim(base_url_openai)) > 0
				THEN json_object('base', trim(base_url_openai))
				ELSE NULL
			END,
			'anthropic',
			CASE
				WHEN base_url_anthropic IS NOT NULL AND length(trim(base_url_anthropic)) > 0
				THEN json_object('base', trim(base_url_anthropic))
				ELSE NULL
			END,
			'gemini',
			CASE
				WHEN base_url_gemini IS NOT NULL AND length(trim(base_url_gemini)) > 0
				THEN json_object('base', trim(base_url_gemini))
				ELSE NULL
			END
		)
	),
	'{}'
);
-- Phase 2: endpoints is authoritative; drop legacy base_url_* columns.
-- Apply after code that no longer reads/writes these columns is deployed.
ALTER TABLE providers DROP COLUMN base_url_openai;
ALTER TABLE providers DROP COLUMN base_url_anthropic;
ALTER TABLE providers DROP COLUMN base_url_gemini;
ALTER TABLE api_key_request_logs ADD COLUMN billing_kind TEXT;
ALTER TABLE api_key_request_logs ADD COLUMN input_image_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE api_key_request_logs ADD COLUMN output_image_count INTEGER NOT NULL DEFAULT 0;
