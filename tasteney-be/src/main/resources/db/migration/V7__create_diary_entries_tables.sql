CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    city VARCHAR(255),
    rating NUMERIC(4, 2) NOT NULL,
    notes TEXT NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    archetype VARCHAR(64) NOT NULL,
    subtype VARCHAR(128),
    sensory_descriptors TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_created_at ON diary_entries(created_at);
