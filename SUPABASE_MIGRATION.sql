-- ============================================================
-- Migration Supabase — Biproductive nouvelles sections
-- À exécuter dans l'éditeur SQL de votre dashboard Supabase
-- ============================================================

-- ─── 1. Table : todos (section To Do) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS todos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text        text NOT NULL,
  completed   boolean DEFAULT false NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own todos"
  ON todos
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── 2. Table : bilearning_articles (section Bilearning) ─────────────────────
CREATE TABLE IF NOT EXISTS bilearning_articles (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bilearning_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own articles"
  ON bilearning_articles
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
