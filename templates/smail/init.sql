CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    to_address TEXT,
    from_name TEXT,
    from_address TEXT,
    subject TEXT,
    time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_to_address_time ON emails (to_address, time DESC);
CREATE INDEX IF NOT EXISTS idx_emails_time ON emails (time);
