CREATE TABLE secrets (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    encrypted_content TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    max_views INTEGER,
    view_count INTEGER NOT NULL DEFAULT 0,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

