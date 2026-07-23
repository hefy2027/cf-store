-- WikiShare D1 初始化 SQL（合并自仓库 migrations/0001~0003）

-- 0001_initial.sql
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
insert or ignore into settings (key, value) values ('max_upload_bytes', '104857600');
insert or ignore into settings (key, value) values ('trash_retention_days', '30');
insert or ignore into settings (key, value) values ('trash_max_bytes', '21474836480');

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
