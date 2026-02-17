"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  total_minutes: number;
  level: number;
  stat_type: "eloquence" | "force" | "agilite" | null;
  created_at: string;
}

export interface DeepworkSession {
  id: string;
  user_id: string;
  skill_id: string;
  duration_min: number;
  xp_earned: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export type SkillInsert = Pick<Skill, "name"> &
  Partial<Pick<Skill, "icon" | "color" | "stat_type">>;

// Skill level thresholds in hours
const LEVEL_THRESHOLDS = [0, 10, 50, 200, 500];
const LEVEL_TITLES = ["Novice", "Apprenti", "Adepte", "Expert", "Maître Légendaire"];

export function getSkillLevel(totalMinutes: number): { level: number; title: string; progress: number; nextHours: number } {
  const hours = totalMinutes / 60;
  let lvl = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (hours >= LEVEL_THRESHOLDS[i]) {
      lvl = i;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[lvl];
  const nextThreshold = LEVEL_THRESHOLDS[lvl + 1] ?? LEVEL_THRESHOLDS[lvl] + 500;
  const progress = (hours - currentThreshold) / (nextThreshold - currentThreshold);

  return {
    level: lvl + 1,
    title: LEVEL_TITLES[lvl],
    progress: Math.min(progress, 1),
    nextHours: nextThreshold,
  };
}

interface ActiveTimer {
  skillId: string;
  startedAt: number; // Date.now()
  elapsed: number;   // seconds (updated by interval)
  intervalId: ReturnType<typeof setInterval> | null;
}

interface DeepworkState {
  skills: Skill[];
  sessions: DeepworkSession[];
  activeTimer: ActiveTimer | null;
  loading: boolean;
  error: string | null;

  fetchSkills: () => Promise<void>;
  fetchSessions: (days?: number) => Promise<void>;
  addSkill: (skill: SkillInsert) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  startTimer: (skillId: string) => void;
  stopTimer: () => Promise<void>;
  tickTimer: () => void;
}

export const useDeepworkStore = create<DeepworkState>((set, get) => ({
  skills: [],
  sessions: [],
  activeTimer: null,
  loading: false,
  error: null,

  fetchSkills: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ skills: (data ?? []) as Skill[], loading: false });
  },

  fetchSessions: async (days = 30) => {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("deepwork_sessions")
      .select("*")
      .gte("started_at", since.toISOString())
      .order("started_at", { ascending: false });

    if (error) {
      set({ error: error.message });
      return;
    }
    set({ sessions: (data ?? []) as DeepworkSession[] });
  },

  addSkill: async (skill) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSkill = {
      user_id: user.id,
      name: skill.name,
      icon: skill.icon ?? "code",
      color: skill.color ?? "#f59e0b",
      stat_type: skill.stat_type ?? null,
    };

    const { data, error } = await supabase
      .from("skills")
      .insert(newSkill as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ skills: [...s.skills, data as Skill] }));
  },

  deleteSkill: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }));
  },

  startTimer: (skillId) => {
    const existing = get().activeTimer;
    if (existing) {
      if (existing.intervalId) clearInterval(existing.intervalId);
    }

    const intervalId = setInterval(() => get().tickTimer(), 1000);

    set({
      activeTimer: {
        skillId,
        startedAt: Date.now(),
        elapsed: 0,
        intervalId,
      },
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
    const { activeTimer, skills } = get();
    if (!activeTimer) return;

    if (activeTimer.intervalId) clearInterval(activeTimer.intervalId);

    const durationMin = Math.max(1, Math.round(activeTimer.elapsed / 60));
    const xpEarned = durationMin * 2; // 2 XP per minute

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ activeTimer: null });
      return;
    }

    // Save session
    const { data: session, error } = await supabase
      .from("deepwork_sessions")
      .insert({
        user_id: user.id,
        skill_id: activeTimer.skillId,
        duration_min: durationMin,
        xp_earned: xpEarned,
        started_at: new Date(activeTimer.startedAt).toISOString(),
        ended_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (!error && session) {
      set((s) => ({ sessions: [session as DeepworkSession, ...s.sessions] }));
    }

    // Update skill total_minutes
    const skill = skills.find((sk) => sk.id === activeTimer.skillId);
    if (skill) {
      const newTotal = skill.total_minutes + durationMin;
      const newLevel = getSkillLevel(newTotal).level;

      await supabase
        .from("skills")
        .update({ total_minutes: newTotal, level: newLevel } as any)
        .eq("id", skill.id);

      set((s) => ({
        skills: s.skills.map((sk) =>
          sk.id === skill.id ? { ...sk, total_minutes: newTotal, level: newLevel } : sk
        ),
      }));
    }

    // XP distribution
    await supabase.from("xp_logs").insert({
      user_id: user.id,
      amount: xpEarned,
      source_type: "deepwork",
      source_id: activeTimer.skillId,
      stat_type: skill?.stat_type ?? null,
    } as any);

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, stat_eloquence, stat_force, stat_agilite")
      .eq("id", user.id)
      .single();

    if (profile) {
      const updates: Record<string, number> = {
        total_xp: (profile as any).total_xp + xpEarned,
      };
      if (skill?.stat_type === "eloquence") updates.stat_eloquence = (profile as any).stat_eloquence + xpEarned;
      if (skill?.stat_type === "force") updates.stat_force = (profile as any).stat_force + xpEarned;
      if (skill?.stat_type === "agilite") updates.stat_agilite = (profile as any).stat_agilite + xpEarned;

      await supabase.from("profiles").update(updates as any).eq("id", user.id);
    }

    set({ activeTimer: null });
  },
}));
