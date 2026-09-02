-- MOOD Contribution Registry Schema
-- Version: v0.1.0

-- Contribution Types
-- code, research, documentation, community, infrastructure

CREATE TABLE IF NOT EXISTS contributions (
    id TEXT PRIMARY KEY,
    contributor TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('code', 'research', 'documentation', 'community', 'infrastructure')),
    title TEXT NOT NULL,
    description TEXT,
    evidence TEXT, -- JSON array stored as text
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'pending', 'verified', 'recorded', 'rewarded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_contributions_contributor ON contributions(contributor);
CREATE INDEX idx_contributions_type ON contributions(type);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_created_at ON contributions(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_contributions_timestamp
    AFTER UPDATE ON contributions
    FOR EACH ROW
    BEGIN
        UPDATE contributions SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
