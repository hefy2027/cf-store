-- Emaction Backend D1 初始化：reactions 表用于存储 GitHub 风格 reaction 计数
CREATE TABLE IF NOT EXISTS reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT NOT NULL,
  reaction_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (target_id, reaction_name)
);
