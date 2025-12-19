CREATE TABLE IF NOT EXISTS buckets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  bucket_id INTEGER REFERENCES buckets(id),
  message_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO buckets (name) VALUES 
  ('Notes'),
  ('Code'),
  ('Decisions'),
  ('Risks'),
  ('Metrics'),
  ('Tasks')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_chunks_message_id ON chunks(message_id);
CREATE INDEX IF NOT EXISTS idx_chunks_bucket_id ON chunks(bucket_id);
