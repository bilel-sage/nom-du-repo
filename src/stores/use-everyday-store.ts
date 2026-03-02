"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

// ─── Predefined tasks ─────────────────────────────────────────────────────────

export interface EverydayTask {
  id: string;
  title: string;
  duration: number; // minutes
  emoji: string;
}

export const EVERYDAY_TASKS: EverydayTask[] = [
  { id: "lecture",  title: "Lecture",                duration: 60,  emoji: "📖" },
  { id: "sport",    title: "Sport",                   duration: 30,  emoji: "🏃" },
  { id: "muscu",    title: "Musculation",             duration: 60,  emoji: "💪" },
  { id: "info",     title: "Formation Informatique",  duration: 120, emoji: "💻" },
  { id: "anglais",  title: "Formation Anglais",       duration: 60,  emoji: "🇬🇧" },
];

// ─── Session type ─────────────────────────────────────────────────────────────

export interface EverydaySession {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

// ─── Active timer (persisted to localStorage) ─────────────────────────────────

export interface EverydayTimerData {
  taskId: string;
  startTimestamp: number; // Date.now() at start
  targetSeconds: number;
}

// ─── Audio helpers ────────────────────────────────────────────────────────────

function playBeep(frequency = 880, duration = 0.4) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => { try { ctx.close(); } catch {} }, (duration + 0.2) * 1000);
  } catch {}
}

function sendNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {}
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface EverydayState {
  /** Today's completed sessions (fetched from Supabase) */
  todaySessions: EverydaySession[];
  /** Active timer data — persisted to localStorage */
  activeTimerData: EverydayTimerData | null;
  /** In-memory interval ID — not persisted */
  intervalId: ReturnType<typeof setInterval> | null;
  /** Current seconds left (derived, updated by tickTimer) */
  secondsLeft: number;
  loading: boolean;
  /** Guard against duplicate completion calls */
  completing: boolean;

  fetchTodaySessions: () => Promise<void>;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  tickTimer: () => void;
  completeSession: () => Promise<void>;
  /** Called on component mount to resume an in-progress timer */
  resumeIfActive: () => void;
}

export const useEverydayStore = create<EverydayState>()(
  persist(
    (set, get) => ({
      todaySessions: [],
      activeTimerData: null,
      intervalId: null,
      secondsLeft: 0,
      loading: false,
      completing: false,

      fetchTodaySessions: async () => {
        set({ loading: true });
        const supabase = createClient();
        const today = getTodayStr();

        const { data, error } = await supabase
          .from("everyday_sessions")
          .select("*")
          .eq("date", today)
          .eq("completed", true)
          .order("started_at", { ascending: true });

        if (!error) {
          set({ todaySessions: (data ?? []) as EverydaySession[] });
        }
        set({ loading: false });
      },

      startTimer: (taskId) => {
        const { activeTimerData, intervalId: existingInterval } = get();

        // Clear any existing interval
        if (existingInterval) clearInterval(existingInterval);

        const task = EVERYDAY_TASKS.find((t) => t.id === taskId);
        if (!task) return;

        // Request notification permission
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }

        const targetSeconds = task.duration * 60;
        const timerData: EverydayTimerData = {
          taskId,
          startTimestamp: Date.now(),
          targetSeconds,
        };

        const id = setInterval(() => get().tickTimer(), 500);
        set({
          activeTimerData: timerData,
          intervalId: id,
          secondsLeft: targetSeconds,
          completing: false,
        });
      },

      stopTimer: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({ activeTimerData: null, intervalId: null, secondsLeft: 0, completing: false });
      },

      tickTimer: () => {
        const { activeTimerData, completing } = get();
        if (!activeTimerData || completing) return;

        const elapsed = (Date.now() - activeTimerData.startTimestamp) / 1000;
        const remaining = activeTimerData.targetSeconds - elapsed;

        if (remaining <= 0) {
          get().completeSession();
          return;
        }

        set({ secondsLeft: Math.ceil(remaining) });
      },

      completeSession: async () => {
        const { activeTimerData, completing, intervalId } = get();
        if (!activeTimerData || completing) return;

        // Immediately lock to prevent duplicate calls
        if (intervalId) clearInterval(intervalId);
        set({ completing: true, intervalId: null, secondsLeft: 0 });

        const task = EVERYDAY_TASKS.find((t) => t.id === activeTimerData.taskId);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const today = getTodayStr();
          const { data, error } = await supabase
            .from("everyday_sessions")
            .insert({
              user_id: user.id,
              task_id: activeTimerData.taskId,
              started_at: new Date(activeTimerData.startTimestamp).toISOString(),
              ended_at: new Date().toISOString(),
              duration_seconds: activeTimerData.targetSeconds,
              completed: true,
              date: today,
            })
            .select()
            .single();

          if (!error && data) {
            set((s) => ({ todaySessions: [...s.todaySessions, data as EverydaySession] }));
          }
        }

        playBeep(880, 0.3);
        setTimeout(() => playBeep(1046, 0.6), 300);
        if (task) {
          sendNotification("Session terminée !", `${task.emoji} ${task.title} — Bien joué !`);
        }

        set({ activeTimerData: null, completing: false });
      },

      resumeIfActive: () => {
        const { activeTimerData, intervalId } = get();
        if (!activeTimerData) return;

        // Clear any stale interval
        if (intervalId) clearInterval(intervalId);

        const elapsed = (Date.now() - activeTimerData.startTimestamp) / 1000;
        const remaining = activeTimerData.targetSeconds - elapsed;

        if (remaining <= 0) {
          // Already elapsed while away — auto-complete
          get().completeSession();
          return;
        }

        // Resume countdown
        const id = setInterval(() => get().tickTimer(), 500);
        set({ intervalId: id, secondsLeft: Math.ceil(remaining), completing: false });
      },
    }),
    {
      name: "biproductive-everyday",
      // Only persist the active timer data, not runtime state
      partialize: (state) => ({ activeTimerData: state.activeTimerData }),
    }
  )
);
