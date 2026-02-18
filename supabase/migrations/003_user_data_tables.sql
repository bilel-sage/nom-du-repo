-- ============================================================
-- Migration 003 : Tables pour Notes, Objectifs, Idées,
--                 Agenda et Rituels
-- À coller dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── 1. Notes (Vide-Tête) ─────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null,
  created_at timestamptz default now() not null
);

alter table notes enable row level security;
create policy "notes_select" on notes for select using (auth.uid() = user_id);
create policy "notes_insert" on notes for insert with check (auth.uid() = user_id);
create policy "notes_delete" on notes for delete using (auth.uid() = user_id);

-- ── 2. Objectifs ─────────────────────────────────────────────
create table if not exists objectifs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  deadline   date not null,
  done       boolean default false not null,
  created_at timestamptz default now() not null
);

alter table objectifs enable row level security;
create policy "objectifs_select" on objectifs for select using (auth.uid() = user_id);
create policy "objectifs_insert" on objectifs for insert with check (auth.uid() = user_id);
create policy "objectifs_update" on objectifs for update using (auth.uid() = user_id);
create policy "objectifs_delete" on objectifs for delete using (auth.uid() = user_id);

-- ── 3. Idées Business ────────────────────────────────────────
create table if not exists idees (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null,
  note       text default '' not null,
  created_at timestamptz default now() not null
);

alter table idees enable row level security;
create policy "idees_select" on idees for select using (auth.uid() = user_id);
create policy "idees_insert" on idees for insert with check (auth.uid() = user_id);
create policy "idees_update" on idees for update using (auth.uid() = user_id);
create policy "idees_delete" on idees for delete using (auth.uid() = user_id);

-- ── 4. Tâches Agenda ─────────────────────────────────────────
create table if not exists agenda_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  agenda_type text not null check (agenda_type in ('ecole', 'travail')),
  day_index   integer not null check (day_index between 0 and 6),
  text        text not null,
  time        text,
  done        boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table agenda_tasks enable row level security;
create policy "agenda_tasks_select" on agenda_tasks for select using (auth.uid() = user_id);
create policy "agenda_tasks_insert" on agenda_tasks for insert with check (auth.uid() = user_id);
create policy "agenda_tasks_update" on agenda_tasks for update using (auth.uid() = user_id);
create policy "agenda_tasks_delete" on agenda_tasks for delete using (auth.uid() = user_id);

-- ── 5. Rituels ───────────────────────────────────────────────
create table if not exists rituels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  zone       text not null check (zone in ('matin', 'soir')),
  text       text not null,
  done       boolean default false not null,
  position   integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table rituels enable row level security;
create policy "rituels_select" on rituels for select using (auth.uid() = user_id);
create policy "rituels_insert" on rituels for insert with check (auth.uid() = user_id);
create policy "rituels_update" on rituels for update using (auth.uid() = user_id);
create policy "rituels_delete" on rituels for delete using (auth.uid() = user_id);
