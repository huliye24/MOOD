-- MOOD Contributors Schema
-- Version: v0.1.0

CREATE TABLE IF NOT EXISTS contributors (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    name TEXT,
    bio TEXT,
    total_contributions INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_contributors_wallet ON contributors(wallet_address);
CREATE INDEX idx_contributors_reputation ON contributors(reputation_score DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_contributors_timestamp
    AFTER UPDATE ON contributors
    FOR EACH ROW
    BEGIN
        UPDATE contributors SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
