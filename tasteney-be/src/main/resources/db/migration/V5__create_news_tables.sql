-- Create news_articles table and indexes for news management

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY,
    headline VARCHAR(255) NOT NULL,
    text VARCHAR(1000) NOT NULL,
    image_path VARCHAR(512),
    link VARCHAR(512),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_active ON news_articles(is_active);
