-- ============================================
-- FIX 1: Trigger auto-création du profil
-- Quand un user s'inscrit via Supabase Auth,
-- le profil est créé automatiquement côté serveur
-- (bypass la RLS, résout le problème du signup)
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Supprime le trigger s'il existe déjà
drop trigger if exists on_auth_user_created on auth.users;

-- Crée le trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- FIX 2: Policies RLS avec WITH CHECK explicite
-- Les anciennes policies "for all using(...)" ne
-- suffisent pas pour INSERT sur certaines configs.
-- On les remplace par des policies séparées.
-- ============================================

-- PROFILES
drop policy if exists "Users manage own data" on profiles;
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete" on profiles for delete using (auth.uid() = id);

-- QUESTS
drop policy if exists "Users manage own quests" on quests;
create policy "quests_select" on quests for select using (auth.uid() = user_id);
create policy "quests_insert" on quests for insert with check (auth.uid() = user_id);
create policy "quests_update" on quests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quests_delete" on quests for delete using (auth.uid() = user_id);

-- MACRO_GOALS
drop policy if exists "Users manage own macro_goals" on macro_goals;
create policy "macro_goals_select" on macro_goals for select using (auth.uid() = user_id);
create policy "macro_goals_insert" on macro_goals for insert with check (auth.uid() = user_id);
create policy "macro_goals_update" on macro_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "macro_goals_delete" on macro_goals for delete using (auth.uid() = user_id);

-- HABITS
drop policy if exists "Users manage own habits" on habits;
create policy "habits_select" on habits for select using (auth.uid() = user_id);
create policy "habits_insert" on habits for insert with check (auth.uid() = user_id);
create policy "habits_update" on habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete" on habits for delete using (auth.uid() = user_id);

-- HABIT_LOGS
drop policy if exists "Users manage own habit_logs" on habit_logs;
create policy "habit_logs_select" on habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs_insert" on habit_logs for insert with check (auth.uid() = user_id);
create policy "habit_logs_update" on habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_delete" on habit_logs for delete using (auth.uid() = user_id);

-- SKILLS
drop policy if exists "Users manage own skills" on skills;
create policy "skills_select" on skills for select using (auth.uid() = user_id);
create policy "skills_insert" on skills for insert with check (auth.uid() = user_id);
create policy "skills_update" on skills for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skills_delete" on skills for delete using (auth.uid() = user_id);

-- DEEPWORK_SESSIONS
drop policy if exists "Users manage own deepwork_sessions" on deepwork_sessions;
create policy "deepwork_sessions_select" on deepwork_sessions for select using (auth.uid() = user_id);
create policy "deepwork_sessions_insert" on deepwork_sessions for insert with check (auth.uid() = user_id);
create policy "deepwork_sessions_update" on deepwork_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "deepwork_sessions_delete" on deepwork_sessions for delete using (auth.uid() = user_id);

-- FOCUS_SESSIONS
drop policy if exists "Users manage own focus_sessions" on focus_sessions;
create policy "focus_sessions_select" on focus_sessions for select using (auth.uid() = user_id);
create policy "focus_sessions_insert" on focus_sessions for insert with check (auth.uid() = user_id);
create policy "focus_sessions_update" on focus_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "focus_sessions_delete" on focus_sessions for delete using (auth.uid() = user_id);

-- FOCUS_RITUALS
drop policy if exists "Users manage own focus_rituals" on focus_rituals;
create policy "focus_rituals_select" on focus_rituals for select using (auth.uid() = user_id);
create policy "focus_rituals_insert" on focus_rituals for insert with check (auth.uid() = user_id);
create policy "focus_rituals_update" on focus_rituals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "focus_rituals_delete" on focus_rituals for delete using (auth.uid() = user_id);

-- XP_LOGS
drop policy if exists "Users manage own xp_logs" on xp_logs;
create policy "xp_logs_select" on xp_logs for select using (auth.uid() = user_id);
create policy "xp_logs_insert" on xp_logs for insert with check (auth.uid() = user_id);
create policy "xp_logs_update" on xp_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "xp_logs_delete" on xp_logs for delete using (auth.uid() = user_id);

-- ============================================
-- FIX 3: Créer le profil pour les users existants
-- qui se sont inscrits avant le trigger
-- ============================================
insert into public.profiles (id, username)
select
  id,
  coalesce(raw_user_meta_data ->> 'username', split_part(email, '@', 1))
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
