-- Add is_active flag and index to encyclopedia_articles for soft deletion / deactivation

ALTER TABLE encyclopedia_articles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_articles_active ON encyclopedia_articles(is_active);
