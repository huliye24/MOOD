-- MOOD Reputation Schema
-- Version: v0.1.0

CREATE TABLE IF NOT EXISTS reputation (
    id TEXT PRIMARY KEY,
    contributor TEXT NOT NULL UNIQUE,
    total_score FLOAT DEFAULT 0,
    level TEXT DEFAULT 'Genesis' CHECK (level IN ('Genesis', 'Builder', 'Core Contributor', 'Guardian')),
    contributions INTEGER DEFAULT 0,
    verified_proofs INTEGER DEFAULT 0,
    breakdown TEXT, -- JSON object
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_reputation_contributor ON reputation(contributor);
CREATE INDEX idx_reputation_score ON reputation(total_score DESC);
CREATE INDEX idx_reputation_level ON reputation(level);

-- Reputation history table
CREATE TABLE IF NOT EXISTS reputation_events (
    id TEXT PRIMARY KEY,
    contributor TEXT NOT NULL,
    delta FLOAT NOT NULL,
    reason TEXT NOT NULL,
    contribution_id TEXT,
    proof_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contributor) REFERENCES reputation(contributor)
);

-- Index for history queries
CREATE INDEX idx_reputation_events_contributor ON reputation_events(contributor);
CREATE INDEX idx_reputation_events_timestamp ON reputation_events(timestamp DESC);
