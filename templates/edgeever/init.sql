PRAGMA foreign_keys = ON;

-- ============================================================
-- notebooks
-- ============================================================
CREATE TABLE IF NOT EXISTS notebooks (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  slug TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  workspace_id TEXT NOT NULL DEFAULT 'ws_default',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT,
  CHECK (parent_id IS NULL OR parent_id <> id),
  FOREIGN KEY (parent_id) REFERENCES notebooks(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_notebooks_parent
  ON notebooks(parent_id, is_deleted, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_notebooks_deleted
  ON notebooks(is_deleted, updated_at);
CREATE INDEX IF NOT EXISTS idx_notebooks_workspace_parent
  ON notebooks(workspace_id, parent_id, is_deleted, sort_order, name);

-- Keep triggers on one physical line (remote D1 compatibility).
CREATE TRIGGER trg_notebooks_prevent_cycles BEFORE UPDATE OF parent_id ON notebooks FOR EACH ROW WHEN NEW.parent_id IS NOT NULL BEGIN WITH RECURSIVE ancestors(id, parent_id) AS (SELECT id, parent_id FROM notebooks WHERE id = NEW.parent_id UNION ALL SELECT n.id, n.parent_id FROM notebooks n INNER JOIN ancestors a ON n.id = a.parent_id WHERE a.parent_id IS NOT NULL) SELECT RAISE(ABORT, 'notebook cycle detected') WHERE EXISTS (SELECT 1 FROM ancestors WHERE id = NEW.id); END;

-- ============================================================
-- memos
-- ============================================================
CREATE TABLE IF NOT EXISTS memos (
  id TEXT PRIMARY KEY,
  notebook_id TEXT NOT NULL,
  title TEXT,
  excerpt TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags_json)),
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  source_memo_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(source_memo_ids)),
  merge_source_count INTEGER NOT NULL DEFAULT 0 CHECK (merge_source_count >= 0),
  merged_into_memo_id TEXT,
  merged_at TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'ws_default',
  created_by TEXT NOT NULL DEFAULT 'user',
  updated_by TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (merged_into_memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_memos_notebook_feed
  ON memos(notebook_id, is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_archive_feed
  ON memos(is_archived, is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_merge_target
  ON memos(merged_into_memo_id);
CREATE INDEX IF NOT EXISTS idx_memos_trash_feed
  ON memos(is_deleted, deleted_at DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_workspace_notebook_feed
  ON memos(workspace_id, notebook_id, is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_workspace_archive_feed
  ON memos(workspace_id, is_archived, is_deleted, updated_at DESC);

-- ============================================================
-- memo_contents
-- ============================================================
CREATE TABLE IF NOT EXISTS memo_contents (
  memo_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  content_json TEXT NOT NULL CHECK (json_valid(content_json)),
  content_markdown TEXT NOT NULL DEFAULT '',
  content_text TEXT NOT NULL DEFAULT '',
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memo_contents_revision
  ON memo_contents(memo_id, revision);

-- ============================================================
-- memos_fts (full-text search)
-- ============================================================
CREATE VIRTUAL TABLE IF NOT EXISTS memos_fts USING fts5(
  memo_id UNINDEXED,
  title,
  content_text,
  tags
);

-- ============================================================
-- resources
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  memo_id TEXT NOT NULL,
  original_memo_id TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'edgeever-resources',
  object_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'attachment')),
  mime_type TEXT,
  filename TEXT,
  byte_size INTEGER NOT NULL DEFAULT 0 CHECK (byte_size >= 0),
  sha256 TEXT,
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT,
  FOREIGN KEY (memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (original_memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE (bucket_name, object_key)
);

CREATE INDEX IF NOT EXISTS idx_resources_memo
  ON resources(memo_id, is_deleted, kind);
CREATE INDEX IF NOT EXISTS idx_resources_original_memo
  ON resources(original_memo_id);
CREATE INDEX IF NOT EXISTS idx_resources_object
  ON resources(bucket_name, object_key);

-- ============================================================
-- memo_revisions
-- ============================================================
CREATE TABLE IF NOT EXISTS memo_revisions (
  id TEXT PRIMARY KEY,
  memo_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  title TEXT,
  content_json TEXT NOT NULL CHECK (json_valid(content_json)),
  content_markdown TEXT NOT NULL DEFAULT '',
  content_hash TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  content_text TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memo_revisions_memo
  ON memo_revisions(memo_id, revision DESC);

-- ============================================================
-- api_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS api_tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_value TEXT,
  scopes_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(scopes_json)),
  workspace_id TEXT NOT NULL DEFAULT 'ws_default',
  last_used_at TEXT,
  expires_at TEXT,
  is_revoked INTEGER NOT NULL DEFAULT 0 CHECK (is_revoked IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_workspace
  ON api_tokens(workspace_id, is_revoked, created_at DESC);

-- ============================================================
-- audit_events
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent', 'system')),
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON audit_events(entity_type, entity_id, created_at DESC);

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  is_disabled INTEGER NOT NULL DEFAULT 0 CHECK (is_disabled IN (0, 1)),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username
  ON users(username, is_disabled);

-- ============================================================
-- sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash TEXT,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
  ON sessions(token_hash, revoked_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id, expires_at DESC);

-- ============================================================
-- workspaces
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  is_personal INTEGER NOT NULL DEFAULT 1 CHECK (is_personal IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
-- workspace_members
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (workspace_id, user_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_members_personal_user
  ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
  ON workspace_members(workspace_id, role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_single_owner
  ON workspace_members(workspace_id) WHERE role = 'owner';

-- ============================================================
-- memo_edit_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS memo_edit_sessions (
  id TEXT PRIMARY KEY,
  memo_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent')),
  actor_id TEXT,
  base_revision INTEGER NOT NULL,
  base_content_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (memo_id) REFERENCES memos(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memo_edit_sessions_memo
  ON memo_edit_sessions(memo_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_memo_edit_sessions_expiry
  ON memo_edit_sessions(expires_at);

-- ============================================================
-- mobile_sync_changes
-- ============================================================
CREATE TABLE IF NOT EXISTS mobile_sync_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('notebook', 'memo')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
  changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_mobile_sync_changes_workspace_cursor
  ON mobile_sync_changes(workspace_id, id);

CREATE TRIGGER trg_mobile_sync_notebooks_insert AFTER INSERT ON notebooks BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (NEW.workspace_id, 'notebook', NEW.id, 'upsert'); END;
CREATE TRIGGER trg_mobile_sync_notebooks_update AFTER UPDATE ON notebooks BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (NEW.workspace_id, 'notebook', NEW.id, (CASE WHEN NEW.is_deleted = 1 THEN 'delete' ELSE 'upsert' END)); END;
CREATE TRIGGER trg_mobile_sync_notebooks_delete AFTER DELETE ON notebooks BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (OLD.workspace_id, 'notebook', OLD.id, 'delete'); END;
CREATE TRIGGER trg_mobile_sync_memos_insert AFTER INSERT ON memos BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (NEW.workspace_id, 'memo', NEW.id, 'upsert'); END;
CREATE TRIGGER trg_mobile_sync_memos_update AFTER UPDATE ON memos BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (NEW.workspace_id, 'memo', NEW.id, 'upsert'); END;
CREATE TRIGGER trg_mobile_sync_memos_delete AFTER DELETE ON memos BEGIN INSERT INTO mobile_sync_changes (workspace_id, entity_type, entity_id, operation) VALUES (OLD.workspace_id, 'memo', OLD.id, 'delete'); END;

-- ============================================================
-- Seed data
-- ============================================================
INSERT OR IGNORE INTO workspaces (id, name, is_personal) VALUES ('ws_default', 'Personal workspace', 1);

INSERT OR IGNORE INTO notebooks (id, parent_id, name, slug, icon, color, sort_order, workspace_id)
VALUES
  ('nb_inbox', NULL, '等待分类', 'inbox', 'notebook', '#0f766e', 10, 'ws_default'),
  ('nb_projects', NULL, '工作项目', 'work-projects', 'notebook', '#2563eb', 20, 'ws_default'),
  ('nb_learning', NULL, '学习资料', 'learning-resources', 'notebook', '#7c3aed', 30, 'ws_default'),
  ('nb_creative', NULL, '灵感创作', 'creative-ideas', 'notebook', '#db2777', 40, 'ws_default'),
  ('nb_personal', NULL, '生活个人', 'personal-life', 'notebook', '#ea580c', 50, 'ws_default');

INSERT OR IGNORE INTO memos (
  id, notebook_id, title, excerpt, tags_json, workspace_id, created_by, updated_by
)
VALUES (
  'memo_welcome', 'nb_inbox', '欢迎来到 EdgeEver',
  '这是第一条 EdgeEver 笔记，三栏、边缘、Agent-ready。',
  '["edgeever","welcome"]', 'ws_default', 'system', 'system'
);

INSERT OR IGNORE INTO memo_contents (
  memo_id, content_json, content_markdown, content_text, content_hash, revision
)
VALUES (
  'memo_welcome',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"欢迎来到 EdgeEver"}]},{"type":"paragraph","content":[{"type":"text","text":"这是第一条 EdgeEver 笔记，三栏、边缘、Agent-ready。"}]},{"type":"paragraph","content":[{"type":"text","text":"接下来可以创建笔记本、写笔记、搜索内容，并把多条笔记合并成一条新的长期笔记。"}]}]}',
  '## 欢迎来到 EdgeEver

这是第一条 EdgeEver 笔记，三栏、边缘、Agent-ready。

接下来可以创建笔记本、写笔记、搜索内容，并把多条笔记合并成一条新的长期笔记。',
  '欢迎来到 EdgeEver 这是第一条 EdgeEver 笔记，三栏、边缘、Agent-ready。 接下来可以创建笔记本、写笔记、搜索内容，并把多条笔记合并成一条新的长期笔记。',
  'seed', 0
);

INSERT OR IGNORE INTO memos_fts (memo_id, title, content_text, tags)
VALUES (
  'memo_welcome', '欢迎来到 EdgeEver',
  '欢迎来到 EdgeEver 这是第一条 EdgeEver 笔记，三栏、边缘、Agent-ready。 接下来可以创建笔记本、写笔记、搜索内容，并把多条笔记合并成一条新的长期笔记。',
  'edgeever welcome'
);
