DROP TABLE IF EXISTS count_log;
DROP TABLE IF EXISTS count_goal;

CREATE TABLE count_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    count INT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE count_goal (
    name TEXT PRIMARY KEY,
    goal INT NOT NULL
);

DROP TABLE IF EXISTS settings;

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
