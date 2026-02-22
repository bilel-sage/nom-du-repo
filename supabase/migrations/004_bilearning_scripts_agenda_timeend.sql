-- ============================================================
-- Migration 004 : Bilearning Scripts & Agenda heure de fin
-- À coller dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ── 1. bilearning_articles : ajout is_read + type ────────────
--
--  is_read : marque un article comme lu / un script comme terminé
--  type    : 'article' (défaut) ou 'script'

ALTER TABLE bilearning_articles
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

ALTER TABLE bilearning_articles
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'article'
  CHECK (type IN ('article', 'script'));

-- ── 2. agenda_tasks : ajout time_end ─────────────────────────
--
--  time     : heure de début (colonne existante)
--  time_end : heure de fin (nouveau)
--  La durée est calculée côté client avec computeDuration()

ALTER TABLE agenda_tasks
  ADD COLUMN IF NOT EXISTS time_end text;
