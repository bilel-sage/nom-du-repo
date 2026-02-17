-- ============================================
-- ECLIPSE — Schema initial
-- ============================================

-- Macro-objectifs (créé en premier car référencé par quests)
create table macro_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  target_date   date,
  is_achieved   boolean default false,
  created_at    timestamptz default now()
);

-- Profils utilisateurs + stats RPG
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  level         int default 1,
  total_xp      int default 0,
  stat_eloquence   int default 0,
  stat_force       int default 0,
  stat_agilite     int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Quêtes (To-Do gamifié)
create table quests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  is_completed  boolean default false,
  urgency       int default 1 check (urgency between 1 and 4),
  importance    int default 1 check (importance between 1 and 4),
  deadline      timestamptz,
  xp_reward     int default 10,
  stat_type     text check (stat_type in ('eloquence','force','agilite')),
  macro_goal_id uuid references macro_goals(id) on delete set null,
  completed_at  timestamptz,
  created_at    timestamptz default now()
);

-- Habitudes
create table habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  name          text not null,
  icon          text default 'circle-check',
  color         text default '#6366f1',
  xp_per_check  int default 5,
  stat_type     text check (stat_type in ('eloquence','force','agilite')),
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Logs d'habitudes
create table habit_logs (
  id            uuid primary key default gen_random_uuid(),
  habit_id      uuid not null references habits(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  date          date not null default current_date,
  is_done       boolean default false,
  unique(habit_id, date)
);

-- Compétences Deepwork
create table skills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  name          text not null,
  icon          text default 'code',
  color         text default '#f59e0b',
  total_minutes int default 0,
  level         int default 1,
  stat_type     text check (stat_type in ('eloquence','force','agilite')),
  created_at    timestamptz default now()
);

-- Sessions Deepwork
create table deepwork_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  skill_id      uuid not null references skills(id) on delete cascade,
  duration_min  int not null,
  xp_earned     int default 0,
  started_at    timestamptz not null,
  ended_at      timestamptz,
  created_at    timestamptz default now()
);

-- Sessions Focus / Pomodoro
create table focus_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  skill_id      uuid references skills(id) on delete set null,
  duration_min  int not null default 25,
  break_min     int not null default 5,
  rounds_target int default 4,
  rounds_done   int default 0,
  status        text default 'completed' check (status in ('completed','abandoned')),
  xp_earned     int default 0,
  started_at    timestamptz not null,
  created_at    timestamptz default now()
);

-- Rituels de concentration
create table focus_rituals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  label         text not null,
  icon          text default 'check',
  sort_order    int default 0,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Historique XP
create table xp_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  amount        int not null,
  source_type   text not null,
  source_id     uuid,
  stat_type     text check (stat_type in ('eloquence','force','agilite')),
  created_at    timestamptz default now()
);

-- ============================================
-- RLS
-- ============================================
alter table profiles          enable row level security;
alter table quests             enable row level security;
alter table macro_goals        enable row level security;
alter table habits             enable row level security;
alter table habit_logs         enable row level security;
alter table skills             enable row level security;
alter table deepwork_sessions  enable row level security;
alter table focus_sessions     enable row level security;
alter table focus_rituals      enable row level security;
alter table xp_logs            enable row level security;

create policy "Users manage own data" on profiles for all using (auth.uid() = id);
create policy "Users manage own quests" on quests for all using (auth.uid() = user_id);
create policy "Users manage own macro_goals" on macro_goals for all using (auth.uid() = user_id);
create policy "Users manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users manage own habit_logs" on habit_logs for all using (auth.uid() = user_id);
create policy "Users manage own skills" on skills for all using (auth.uid() = user_id);
create policy "Users manage own deepwork_sessions" on deepwork_sessions for all using (auth.uid() = user_id);
create policy "Users manage own focus_sessions" on focus_sessions for all using (auth.uid() = user_id);
create policy "Users manage own focus_rituals" on focus_rituals for all using (auth.uid() = user_id);
create policy "Users manage own xp_logs" on xp_logs for all using (auth.uid() = user_id);

-- ============================================
-- INDEX
-- ============================================
create index idx_quests_user        on quests(user_id, is_completed);
create index idx_habits_user        on habits(user_id, is_active);
create index idx_habit_logs_date    on habit_logs(habit_id, date);
create index idx_deepwork_user      on deepwork_sessions(user_id, started_at);
create index idx_focus_user         on focus_sessions(user_id, started_at);
create index idx_xp_logs_user       on xp_logs(user_id, created_at);
