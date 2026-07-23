PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY, -- 账号唯一标识，建议使用 UUID 或稳定字符串
  email TEXT NOT NULL UNIQUE, -- 账号对应的真实邮箱地址
  remark TEXT, -- 账号备注，用于前端展示或辅助区分账号
  sort_order INTEGER NOT NULL DEFAULT 0 -- 侧边栏排序值，数值越小越靠前
);

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY, -- 邮件记录唯一标识，建议使用系统生成 ID 或消息指纹
  account_id TEXT NOT NULL, -- 所属账号 ID，关联 accounts.id
  subject TEXT, -- 邮件主题
  from_name TEXT, -- 发件人显示名称
  from_address TEXT, -- 发件人邮箱地址
  delivered_to TEXT, -- 实际投递命中的账号邮箱地址，用于标识这封邮件属于哪个自动转发账号
  recipient TEXT, -- To 原始内容，通常保存收件人列表文本或 JSON 字符串
  cc TEXT, -- Cc 原始内容，通常保存抄送列表文本或 JSON 字符串
  bcc TEXT, -- Bcc 原始内容，通常保存密送列表文本或 JSON 字符串
  sent_at INTEGER, -- 邮件声明的发送时间，入库时统一转为 UTC 秒级时间戳
  body TEXT, -- 邮件正文，优先保存 HTML，没有 HTML 时回退保存纯文本
  raw_headers TEXT, -- 原始邮件头全文，便于排查解析问题
  read INTEGER NOT NULL DEFAULT 0 CHECK (read IN (0, 1)), -- 是否已读，0 表示未读，1 表示已读
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY, -- 附件唯一标识
  email_id TEXT NOT NULL, -- 所属邮件 ID，关联 emails.id
  object_key TEXT NOT NULL, -- 附件在 R2 中的对象 key
  filename TEXT NOT NULL, -- 附件文件名
  mimetype TEXT NOT NULL, -- 附件 MIME 类型
  size INTEGER NOT NULL, -- 附件大小，单位为字节
  content_id TEXT, -- 内联附件的 Content-ID，用于在 HTML 正文中引用
  disposition TEXT, -- 附件处置方式，例如 attachment 或 inline
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_sort_order ON accounts(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_emails_account_id ON emails(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_account_sent_at ON emails(account_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(read);
CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);
