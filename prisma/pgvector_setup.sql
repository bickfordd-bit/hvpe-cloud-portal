-- Run this on your Postgres database to enable the pgvector extension and create a table for ANN searches.
-- Requires: Postgres + pgvector extension installed (https://github.com/pgvector/pgvector)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS pg_embeddings (
  id text PRIMARY KEY,
  doc_id text,
  optr_id text,
  vec vector(1536),
  snippet text,
  created_at timestamptz DEFAULT now()
);

-- Create ivfflat index for faster ANN searches (tune lists parameter for your dataset)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'pg_embeddings_vec_idx'
  ) THEN
    CREATE INDEX pg_embeddings_vec_idx ON pg_embeddings USING ivfflat (vec) WITH (lists = 100);
  END IF;
END$$;
