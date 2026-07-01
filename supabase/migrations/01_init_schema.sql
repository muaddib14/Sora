-- Operators (user profiles)
CREATE TABLE operators (
    wallet TEXT PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    skin TEXT DEFAULT 'default',
    season_pass BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seasons
CREATE TABLE seasons (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    prize_pool BIGINT DEFAULT 0,
    merkle_root TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scores (leaderboard)
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    wallet TEXT NOT NULL,
    run_id TEXT NOT NULL UNIQUE,
    score BIGINT NOT NULL,
    elapsed_ms BIGINT NOT NULL,
    mode TEXT DEFAULT 'survival',
    season BIGINT REFERENCES seasons(id),
    seed BIGINT,
    verified BOOLEAN DEFAULT FALSE,
    signature TEXT,
    event_log JSONB,
    reputation FLOAT,
    money BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wallet) REFERENCES operators(wallet)
);

-- Indexes for queries
CREATE INDEX idx_scores_wallet ON scores(wallet);
CREATE INDEX idx_scores_season ON scores(season);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_operators_created_at ON operators(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can read, only owner/verified can write
CREATE POLICY "Scores are viewable by everyone" ON scores
    FOR SELECT USING (true);

CREATE POLICY "Operators are viewable by everyone" ON operators
    FOR SELECT USING (true);

CREATE POLICY "Seasons are viewable by everyone" ON seasons
    FOR SELECT USING (true);
