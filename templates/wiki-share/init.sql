-- WikiShare D1 初始化 SQL（合并自仓库 migrations/0001~0003）

-- 0001_initial.sql
create table if not exists users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'user')),
  expires_at integer,
  disabled_at integer,
  created_at integer not null,
  last_login_at integer
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at integer not null,
  created_at integer not null
);

create index if not exists idx_sessions_token_hash on sessions(token_hash);
create index if not exists idx_sessions_user_id on sessions(user_id);

create table if not exists pages (
  id text primary key,
  title text not null,
  content text not null default '',
  parent_id text,
  type text not null default 'page',
  sort_order integer not null default 0,
  created_at integer not null,
  updated_at integer not null
);
create index if not exists idx_pages_parent on pages(parent_id);

create table if not exists folders (
  id text primary key,
  parent_id text references folders(id) on delete restrict,
  name text not null,
  depth integer not null check (depth between 1 and 3),
  expires_at integer,
  trashed_at integer,
  created_by text not null references users(id),
  created_at integer not null
);

create index if not exists idx_folders_parent_id on folders(parent_id);
create index if not exists idx_folders_trashed_at on folders(trashed_at);
create unique index if not exists idx_folders_sibling_name on folders(coalesce(parent_id, 'root'), name)
where trashed_at is null;

create table if not exists files (
  id text primary key,
  folder_id text not null references folders(id) on delete restrict,
  name text not null,
  r2_key text not null unique,
  size integer not null,
  mime_type text not null,
  sha256 text,
  expires_at integer,
  trashed_at integer,
  deleted_at integer,
  uploaded_by text not null references users(id),
  created_at integer not null
);

create index if not exists idx_files_folder_id on files(folder_id);
create index if not exists idx_files_trashed_at on files(trashed_at);
create index if not exists idx_files_deleted_at on files(deleted_at);

create table if not exists audit_logs (
  id text primary key,
  user_id text,
  action text not null,
  target_type text,
  target_id text,
  ip text,
  user_agent text,
  detail text,
  created_at integer not null
);

create index if not exists idx_audit_logs_created_at on audit_logs(created_at);
create index if not exists idx_audit_logs_user_id on audit_logs(user_id);

create table if not exists settings (
  key text primary key,
  value text not null
);

insert or ignore into settings (key, value) values
  ('max_upload_bytes', '104857600'),
  ('trash_retention_days', '30'),
  ('trash_max_bytes', '21474836480');

-- 0002_shares.sql
create table if not exists shares (
  id text primary key,
  page_id text not null,
  token text not null unique,
  permission text not null,
  password text,
  expire_at integer,
  max_views integer,
  views integer not null default 0,
  created_at integer not null,
  note text
);
create index if not exists idx_shares_page on shares(page_id);

-- 0003_share_url_ids.sql
alter table shares add column url_id text;
create unique index if not exists idx_shares_url_id on shares(url_id) where url_id is not null;
