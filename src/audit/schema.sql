CREATE TABLE IF NOT EXISTS osbg_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    file_path TEXT NOT NULL,
    dcs REAL NOT NULL,
    tsi REAL NOT NULL,
    sdi REAL NOT NULL,
    aai REAL NOT NULL,
    passed INTEGER NOT NULL,
    violations TEXT NOT NULL, -- JSON stringified array
    receipt_hash TEXT NOT NULL UNIQUE,
    coa_ir_version TEXT NOT NULL
);
