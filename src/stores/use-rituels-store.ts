"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type RitualZone = "matin" | "soir";

export interface RitualItem {
  id: string;
  zone: RitualZone;
  text: string;
  done: boolean;
  position: number;
}

type RitualsData = Record<RitualZone, RitualItem[]>;

interface RituelsState {
  rituals: RitualsData;
  loading: boolean;
  fetchRituals: () => Promise<void>;
  addRitual: (zone: RitualZone, text: string) => Promise<void>;
  editRitual: (zone: RitualZone, id: string, text: string) => Promise<void>;
  deleteRitual: (zone: RitualZone, id: string) => Promise<void>;
  toggleRitual: (zone: RitualZone, id: string) => Promise<void>;
  resetZone: (zone: RitualZone) => Promise<void>;
}

export const useRituelsStore = create<RituelsState>((set, get) => ({
  rituals: { matin: [], soir: [] },
  loading: false,

  fetchRituals: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rituels")
      .select("*")
      .order("position", { ascending: true });
    if (!error && data) {
      const items = data as RitualItem[];
      set({
        rituals: {
          matin: items.filter((r) => r.zone === "matin"),
          soir:  items.filter((r) => r.zone === "soir"),
        },
      });
    }
    set({ loading: false });
  },

  addRitual: async (zone, text) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const position = get().rituals[zone].length;
    const { data, error } = await supabase
      .from("rituels")
      .insert({ user_id: user.id, zone, text: text.trim(), done: false, position } as any)
      .select()
      .single();
    if (!error && data) {
      const item = data as RitualItem;
      set((s) => ({ rituals: { ...s.rituals, [zone]: [...s.rituals[zone], item] } }));
    }
  },

  editRitual: async (zone, id, text) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("rituels")
      .update({ text: text.trim() } as any)
      .eq("id", id);
    if (!error) {
      set((s) => ({
        rituals: {
          ...s.rituals,
          [zone]: s.rituals[zone].map((r) => r.id === id ? { ...r, text: text.trim() } : r),
        },
      }));
    }
  },

  deleteRitual: async (zone, id) => {
    const supabase = createClient();
    const { error } = await supabase.from("rituels").delete().eq("id", id);
    if (!error) {
      set((s) => ({
        rituals: { ...s.rituals, [zone]: s.rituals[zone].filter((r) => r.id !== id) },
      }));
    }
  },

  toggleRitual: async (zone, id) => {
    const ritual = get().rituals[zone].find((r) => r.id === id);
    if (!ritual) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("rituels")
      .update({ done: !ritual.done } as any)
      .eq("id", id);
    if (!error) {
      set((s) => ({
        rituals: {
          ...s.rituals,
          [zone]: s.rituals[zone].map((r) => r.id === id ? { ...r, done: !r.done } : r),
        },
      }));
    }
  },

  resetZone: async (zone) => {
    const supabase = createClient();
    const ids = get().rituals[zone].map((r) => r.id);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("rituels")
      .update({ done: false } as any)
      .in("id", ids);
    if (!error) {
      set((s) => ({
        rituals: {
          ...s.rituals,
          [zone]: s.rituals[zone].map((r) => ({ ...r, done: false })),
        },
      }));
    }
  },
}));
