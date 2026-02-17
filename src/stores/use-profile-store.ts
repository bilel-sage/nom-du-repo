"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  stat_eloquence: number;
  stat_force: number;
  stat_agilite: number;
  created_at: string;
  updated_at: string;
}

export interface XpLog {
  id: string;
  user_id: string;
  amount: number;
  source_type: string;
  source_id: string | null;
  stat_type: "eloquence" | "force" | "agilite" | null;
  created_at: string;
}

export interface SkillSummary {
  id: string;
  name: string;
  color: string;
  total_minutes: number;
  level: number;
}

interface ProfileState {
  profile: Profile | null;
  xpLogs: XpLog[];
  skills: SkillSummary[];
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  fetchXpLogs: (limit?: number) => Promise<void>;
  fetchSkills: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  xpLogs: [],
  skills: [],
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ profile: data as Profile, loading: false });
  },

  fetchXpLogs: async (limit = 30) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("xp_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      set({ error: error.message });
      return;
    }
    set({ xpLogs: (data ?? []) as XpLog[] });
  },

  fetchSkills: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("id, name, color, total_minutes, level")
      .order("total_minutes", { ascending: false });

    if (error) {
      set({ error: error.message });
      return;
    }
    set({ skills: (data ?? []) as SkillSummary[] });
  },
}));
