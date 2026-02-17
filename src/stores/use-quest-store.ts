"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  urgency: number;
  importance: number;
  deadline: string | null;
  xp_reward: number;
  stat_type: "eloquence" | "force" | "agilite" | null;
  macro_goal_id: string | null;
  completed_at: string | null;
  created_at: string;
}

export type QuestInsert = Pick<Quest, "title"> &
  Partial<Pick<Quest, "description" | "urgency" | "importance" | "deadline" | "xp_reward" | "stat_type" | "macro_goal_id">>;

interface QuestState {
  quests: Quest[];
  loading: boolean;
  error: string | null;

  fetchQuests: () => Promise<void>;
  addQuest: (quest: QuestInsert) => Promise<void>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  loading: false,
  error: null,

  fetchQuests: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ quests: (data ?? []) as Quest[], loading: false });
  },

  addQuest: async (quest) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newQuest = {
      user_id: user.id,
      title: quest.title,
      description: quest.description ?? null,
      urgency: quest.urgency ?? 1,
      importance: quest.importance ?? 1,
      deadline: quest.deadline ?? null,
      xp_reward: quest.xp_reward ?? 10,
      stat_type: quest.stat_type ?? null,
      macro_goal_id: quest.macro_goal_id ?? null,
    };

    const { data, error } = await supabase
      .from("quests")
      .insert(newQuest as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ quests: [data as Quest, ...s.quests] }));
  },

  updateQuest: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("quests")
      .update(updates as any)
      .eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  },

  toggleComplete: async (id) => {
    const quest = get().quests.find((q) => q.id === id);
    if (!quest) return;

    const is_completed = !quest.is_completed;
    const completed_at = is_completed ? new Date().toISOString() : null;

    const supabase = createClient();
    const { error } = await supabase
      .from("quests")
      .update({ is_completed, completed_at } as any)
      .eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }

    // Award XP if completing
    if (is_completed) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("xp_logs").insert({
          user_id: user.id,
          amount: quest.xp_reward,
          source_type: "quest",
          source_id: id,
          stat_type: quest.stat_type,
        } as any);

        // Update profile XP + stat
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp, stat_eloquence, stat_force, stat_agilite")
          .eq("id", user.id)
          .single();

        if (profile) {
          const updates: Record<string, number> = {
            total_xp: (profile as any).total_xp + quest.xp_reward,
          };
          if (quest.stat_type === "eloquence") updates.stat_eloquence = (profile as any).stat_eloquence + quest.xp_reward;
          if (quest.stat_type === "force") updates.stat_force = (profile as any).stat_force + quest.xp_reward;
          if (quest.stat_type === "agilite") updates.stat_agilite = (profile as any).stat_agilite + quest.xp_reward;

          await supabase.from("profiles").update(updates as any).eq("id", user.id);
        }
      }
    }

    set((s) => ({
      quests: s.quests.map((q) =>
        q.id === id ? { ...q, is_completed, completed_at } : q
      ),
    }));
  },

  deleteQuest: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("quests").delete().eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ quests: s.quests.filter((q) => q.id !== id) }));
  },
}));
