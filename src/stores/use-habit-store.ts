"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

// ─── Fixed categories ────────────────────────────────────────────────────────
export const FIXED_CATEGORIES = [
  { id: "intellectuel", label: "Intellectuel", color: "#6366f1" },
  { id: "business",     label: "Business",     color: "#f59e0b" },
  { id: "islam",        label: "Islam",         color: "#10b981" },
  { id: "sport",        label: "Sport",         color: "#3b82f6" },
  { id: "beaute",       label: "Beauté",        color: "#ec4899" },
] as const;

export type CategoryId = (typeof FIXED_CATEGORIES)[number]["id"];

// ─── localStorage helpers for category mapping ───────────────────────────────
function loadCategoryMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("habit-categories") ?? "{}");
  } catch {
    return {};
  }
}

function saveCategoryMap(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("habit-categories", JSON.stringify(map));
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  xp_per_check: number;
  stat_type: "eloquence" | "force" | "agilite" | null;
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  is_done: boolean;
}

export type HabitInsert = Pick<Habit, "name"> &
  Partial<Pick<Habit, "icon" | "color" | "xp_per_check" | "stat_type">> & {
    category?: string;
  };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(logs: HabitLog[]): number {
  const doneDates = new Set(logs.filter((l) => l.is_done).map((l) => l.date));
  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (!doneDates.has(todayStr)) today.setDate(today.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (doneDates.has(dateStr)) streak++;
    else break;
  }
  return streak;
}

// ─── Store ───────────────────────────────────────────────────────────────────
interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  error: string | null;
  categoryMap: Record<string, string>;

  fetchHabits: () => Promise<void>;
  fetchLogs: (days?: number) => Promise<void>;
  addHabit: (habit: HabitInsert) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Pick<Habit, "name" | "color">>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleDay: (habitId: string, date: string) => Promise<void>;
  setHabitCategory: (habitId: string, categoryId: string) => void;

  // Computed helpers
  getStreakForHabit: (habitId: string) => number;
  isChecked: (habitId: string, date: string) => boolean;
  getWeekProgress: (habitId: string) => number;
  getHabitsByCategory: (categoryId: string) => Habit[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  error: null,
  categoryMap: loadCategoryMap(),

  fetchHabits: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ habits: (data ?? []) as Habit[], loading: false });
  },

  fetchLogs: async (days = 30) => {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .gte("date", sinceStr);
    if (error) { set({ error: error.message }); return; }
    set({ logs: (data ?? []) as HabitLog[] });
  },

  addHabit: async (habit) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newHabit = {
      user_id: user.id,
      name: habit.name,
      icon: habit.icon ?? "circle-check",
      color: habit.color ?? "#6366f1",
      xp_per_check: habit.xp_per_check ?? 5,
      stat_type: habit.stat_type ?? null,
    };

    const { data, error } = await supabase
      .from("habits")
      .insert(newHabit as any)
      .select()
      .single();

    if (error) { set({ error: error.message }); return; }

    const created = data as Habit;
    set((s) => ({ habits: [...s.habits, created] }));

    // Store category in localStorage
    if (habit.category) {
      const newMap = { ...get().categoryMap, [created.id]: habit.category };
      set({ categoryMap: newMap });
      saveCategoryMap(newMap);
    }
  },

  updateHabit: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update(updates as any)
      .eq("id", id);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: async (id) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ is_active: false } as any)
      .eq("id", id);
    if (error) { set({ error: error.message }); return; }

    const newMap = { ...get().categoryMap };
    delete newMap[id];
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      categoryMap: newMap,
    }));
    saveCategoryMap(newMap);
  },

  toggleDay: async (habitId, date) => {
    const { logs } = get();
    const existing = logs.find((l) => l.habit_id === habitId && l.date === date);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (existing) {
      const newDone = !existing.is_done;
      const { error } = await supabase
        .from("habit_logs")
        .update({ is_done: newDone } as any)
        .eq("id", existing.id);
      if (error) { set({ error: error.message }); return; }
      set((s) => ({
        logs: s.logs.map((l) => (l.id === existing.id ? { ...l, is_done: newDone } : l)),
      }));

      const habit = get().habits.find((h) => h.id === habitId);
      if (habit && newDone) {
        await supabase.from("xp_logs").insert({
          user_id: user.id, amount: habit.xp_per_check,
          source_type: "habit", source_id: habitId, stat_type: habit.stat_type,
        } as any);
        const { data: profile } = await supabase.from("profiles")
          .select("total_xp, stat_eloquence, stat_force, stat_agilite")
          .eq("id", user.id).single();
        if (profile) {
          const u: Record<string, number> = { total_xp: (profile as any).total_xp + habit.xp_per_check };
          if (habit.stat_type === "eloquence") u.stat_eloquence = (profile as any).stat_eloquence + habit.xp_per_check;
          if (habit.stat_type === "force") u.stat_force = (profile as any).stat_force + habit.xp_per_check;
          if (habit.stat_type === "agilite") u.stat_agilite = (profile as any).stat_agilite + habit.xp_per_check;
          await supabase.from("profiles").update(u as any).eq("id", user.id);
        }
      }
    } else {
      const { data, error } = await supabase.from("habit_logs")
        .insert({ habit_id: habitId, user_id: user.id, date, is_done: true } as any)
        .select().single();
      if (error) { set({ error: error.message }); return; }
      set((s) => ({ logs: [...s.logs, data as HabitLog] }));

      const habit = get().habits.find((h) => h.id === habitId);
      if (habit) {
        await supabase.from("xp_logs").insert({
          user_id: user.id, amount: habit.xp_per_check,
          source_type: "habit", source_id: habitId, stat_type: habit.stat_type,
        } as any);
        const { data: profile } = await supabase.from("profiles")
          .select("total_xp, stat_eloquence, stat_force, stat_agilite")
          .eq("id", user.id).single();
        if (profile) {
          const u: Record<string, number> = { total_xp: (profile as any).total_xp + habit.xp_per_check };
          if (habit.stat_type === "eloquence") u.stat_eloquence = (profile as any).stat_eloquence + habit.xp_per_check;
          if (habit.stat_type === "force") u.stat_force = (profile as any).stat_force + habit.xp_per_check;
          if (habit.stat_type === "agilite") u.stat_agilite = (profile as any).stat_agilite + habit.xp_per_check;
          await supabase.from("profiles").update(u as any).eq("id", user.id);
        }
      }
    }
  },

  setHabitCategory: (habitId, categoryId) => {
    const newMap = { ...get().categoryMap, [habitId]: categoryId };
    set({ categoryMap: newMap });
    saveCategoryMap(newMap);
  },

  getStreakForHabit: (habitId) => {
    const { logs } = get();
    return calculateStreak(logs.filter((l) => l.habit_id === habitId));
  },

  isChecked: (habitId, date) => {
    const { logs } = get();
    return logs.some((l) => l.habit_id === habitId && l.date === date && l.is_done);
  },

  getWeekProgress: (habitId) => {
    const days = getLast7Days();
    const { logs } = get();
    return days.filter((d) => logs.some((l) => l.habit_id === habitId && l.date === d && l.is_done)).length;
  },

  getHabitsByCategory: (categoryId) => {
    const { habits, categoryMap } = get();
    return habits.filter((h) => categoryMap[h.id] === categoryId);
  },
}));

export { getLast7Days, getToday };
