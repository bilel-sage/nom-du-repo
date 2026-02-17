"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface DashboardProfile {
  level: number;
  total_xp: number;
  stat_eloquence: number;
  stat_force: number;
  stat_agilite: number;
  username: string;
}

export interface DashboardQuest {
  id: string;
  title: string;
  urgency: number;
  importance: number;
  xp_reward: number;
  is_completed: boolean;
  deadline: string | null;
}

export interface DashboardHabit {
  id: string;
  name: string;
  color: string;
  xp_per_check: number;
}

export interface DashboardHabitLog {
  habit_id: string;
  date: string;
  is_done: boolean;
}

export interface DashboardDeepworkSession {
  duration_min: number;
  started_at: string;
}

export interface DashboardXpLog {
  amount: number;
  created_at: string;
}

interface DashboardState {
  profile: DashboardProfile | null;
  quests: DashboardQuest[];
  habits: DashboardHabit[];
  habitLogs: DashboardHabitLog[];
  deepworkSessions: DashboardDeepworkSession[];
  xpLogs: DashboardXpLog[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;

  // Computed
  todayQuestsCompleted: () => number;
  todayQuestsTotal: () => number;
  todayXp: () => number;
  todayDeepworkMinutes: () => number;
  bestStreak: () => number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(habitId: string, logs: DashboardHabitLog[]): number {
  const doneDates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.is_done).map((l) => l.date)
  );
  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (!doneDates.has(todayStr)) {
    today.setDate(today.getDate() - 1);
  }
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (doneDates.has(d.toISOString().split("T")[0])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: null,
  quests: [],
  habits: [],
  habitLogs: [],
  deepworkSessions: [],
  xpLogs: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, error: "Utilisateur non connecté." });
      return;
    }

    const today = getToday();

    // Fetch in parallel
    const [profileRes, questsRes, habitsRes, habitLogsRes, sessionsRes, xpRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("level, total_xp, stat_eloquence, stat_force, stat_agilite, username")
        .eq("id", user.id)
        .single(),
      supabase
        .from("quests")
        .select("id, title, urgency, importance, xp_reward, is_completed, deadline")
        .eq("is_completed", false)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("habits")
        .select("id, name, color, xp_per_check")
        .eq("is_active", true),
      supabase
        .from("habit_logs")
        .select("habit_id, date, is_done")
        .gte("date", new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]),
      supabase
        .from("deepwork_sessions")
        .select("duration_min, started_at")
        .gte("started_at", new Date(Date.now() - 90 * 86400000).toISOString()),
      supabase
        .from("xp_logs")
        .select("amount, created_at")
        .gte("created_at", today + "T00:00:00")
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.error) {
      console.error("Dashboard: profile fetch error", profileRes.error);
      set({ loading: false, error: `Profil introuvable : ${profileRes.error.message}` });
      return;
    }

    set({
      profile: profileRes.data as DashboardProfile,
      quests: (questsRes.data ?? []) as DashboardQuest[],
      habits: (habitsRes.data ?? []) as DashboardHabit[],
      habitLogs: (habitLogsRes.data ?? []) as DashboardHabitLog[],
      deepworkSessions: (sessionsRes.data ?? []) as DashboardDeepworkSession[],
      xpLogs: (xpRes.data ?? []) as DashboardXpLog[],
      loading: false,
    });
  },

  todayQuestsCompleted: () => {
    return get().quests.filter((q) => q.is_completed).length;
  },

  todayQuestsTotal: () => {
    return get().quests.length;
  },

  todayXp: () => {
    return get().xpLogs.reduce((sum, l) => sum + l.amount, 0);
  },

  todayDeepworkMinutes: () => {
    const today = getToday();
    return get().deepworkSessions
      .filter((s) => s.started_at.startsWith(today))
      .reduce((sum, s) => sum + s.duration_min, 0);
  },

  bestStreak: () => {
    const { habits, habitLogs } = get();
    if (habits.length === 0) return 0;
    return Math.max(0, ...habits.map((h) => calculateStreak(h.id, habitLogs)));
  },
}));
