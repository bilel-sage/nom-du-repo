"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

// Re-use the existing `skills` and `deepwork_sessions` tables.
// XP columns are kept at 0 — no gamification logic here.

export interface Task {
  id: string;
  user_id: string;
  name: string;
  color: string;
  total_minutes: number;
  created_at: string;
  mode: string;
}

export interface TaskSession {
  id: string;
  user_id: string;
  skill_id: string;
  duration_min: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export type TaskInsert = Pick<Task, "name"> & Partial<Pick<Task, "color">>;

interface ActiveTimer {
  taskId: string;
  startedAt: number;
  elapsed: number;
  intervalId: ReturnType<typeof setInterval> | null;
}

interface DoItNowState {
  tasks: Task[];
  sessions: TaskSession[];
  activeTimer: ActiveTimer | null;
  loading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  fetchSessions: (days?: number) => Promise<void>;
  addTask: (task: TaskInsert) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  startTimer: (taskId: string) => void;
  stopTimer: () => Promise<void>;
  tickTimer: () => void;
}

const COLOR_OPTIONS = [
  "#f59e0b", "#6366f1", "#ef4444", "#10b981",
  "#3b82f6", "#8b5cf6", "#f97316", "#ec4899",
];

function randomColor() {
  return COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
}

export const useDoItNowStore = create<DoItNowState>((set, get) => ({
  tasks: [],
  sessions: [],
  activeTimer: null,
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("skills")
      .select("id, user_id, name, color, total_minutes, created_at, mode")
      .eq("mode", mode)
      .order("created_at", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ tasks: (data ?? []) as Task[], loading: false });
  },

  fetchSessions: async (days = 30) => {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("deepwork_sessions")
      .select("id, user_id, skill_id, duration_min, started_at, ended_at, created_at")
      .gte("started_at", since.toISOString())
      .order("started_at", { ascending: false });

    if (error) {
      set({ error: error.message });
      return;
    }
    set({ sessions: (data ?? []) as TaskSession[] });
  },

  addTask: async (task) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("skills")
      .insert({
        user_id: user.id,
        name: task.name,
        color: task.color ?? randomColor(),
        icon: "timer",
        stat_type: null,
        mode,
      } as any)
      .select("id, user_id, name, color, total_minutes, created_at, mode")
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ tasks: [...s.tasks, data as Task] }));
  },

  deleteTask: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  startTimer: (taskId) => {
    const existing = get().activeTimer;
    if (existing?.intervalId) clearInterval(existing.intervalId);

    const intervalId = setInterval(() => get().tickTimer(), 1000);
    set({
      activeTimer: { taskId, startedAt: Date.now(), elapsed: 0, intervalId },
    });
  },

  tickTimer: () => {
    set((s) => {
      if (!s.activeTimer) return s;
      return {
        activeTimer: {
          ...s.activeTimer,
          elapsed: Math.floor((Date.now() - s.activeTimer.startedAt) / 1000),
        },
      };
    });
  },

  stopTimer: async () => {
    const { activeTimer, tasks } = get();
    if (!activeTimer) return;

    if (activeTimer.intervalId) clearInterval(activeTimer.intervalId);

    const durationMin = Math.max(1, Math.round(activeTimer.elapsed / 60));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ activeTimer: null });
      return;
    }

    // Save session (xp_earned = 0, no XP system)
    const { data: session, error } = await supabase
      .from("deepwork_sessions")
      .insert({
        user_id: user.id,
        skill_id: activeTimer.taskId,
        duration_min: durationMin,
        xp_earned: 0,
        started_at: new Date(activeTimer.startedAt).toISOString(),
        ended_at: new Date().toISOString(),
      } as any)
      .select("id, user_id, skill_id, duration_min, started_at, ended_at, created_at")
      .single();

    if (!error && session) {
      set((s) => ({ sessions: [session as TaskSession, ...s.sessions] }));
    }

    // Update total_minutes on the task
    const task = tasks.find((t) => t.id === activeTimer.taskId);
    if (task) {
      const newTotal = task.total_minutes + durationMin;
      await supabase
        .from("skills")
        .update({ total_minutes: newTotal } as any)
        .eq("id", task.id);

      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === task.id ? { ...t, total_minutes: newTotal } : t
        ),
      }));
    }

    set({ activeTimer: null });
  },
}));
