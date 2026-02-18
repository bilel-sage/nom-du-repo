"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface DashboardProfile {
  username: string;
}

export interface DashboardHabit {
  id: string;
  name: string;
  color: string;
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

interface DashboardState {
  profile: DashboardProfile | null;
  habits: DashboardHabit[];
  habitLogs: DashboardHabitLog[];
  deepworkSessions: DashboardDeepworkSession[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;

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
  habits: [],
  habitLogs: [],
  deepworkSessions: [],
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

    const [profileRes, habitsRes, habitLogsRes, sessionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single(),
      supabase
        .from("habits")
        .select("id, name, color")
        .eq("is_active", true),
      supabase
        .from("habit_logs")
        .select("habit_id, date, is_done")
        .gte("date", new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]),
      supabase
        .from("deepwork_sessions")
        .select("duration_min, started_at")
        .gte("started_at", new Date(Date.now() - 90 * 86400000).toISOString()),
    ]);

    if (profileRes.error) {
      console.error("Dashboard: profile fetch error", profileRes.error);
      set({ loading: false, error: `Profil introuvable : ${profileRes.error.message}` });
      return;
    }

    set({
      profile: profileRes.data as DashboardProfile,
      habits: (habitsRes.data ?? []) as DashboardHabit[],
      habitLogs: (habitLogsRes.data ?? []) as DashboardHabitLog[],
      deepworkSessions: (sessionsRes.data ?? []) as DashboardDeepworkSession[],
      loading: false,
    });
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
