CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  intro text NOT NULL,
  platforms text[] NOT NULL,
  difficulty text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  cover_image text NOT NULL,
  icon text NOT NULL,
  position integer UNIQUE NOT NULL,
  steps jsonb NOT NULL CHECK (jsonb_typeof(steps) = 'array')
);

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 10),
  seeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tutorial_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL,
  author varchar(24) NOT NULL,
  body varchar(1000) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS ratings_tutorial_idx ON ratings(tutorial_id);
CREATE INDEX IF NOT EXISTS comments_tutorial_idx ON comments(tutorial_id, created_at);
