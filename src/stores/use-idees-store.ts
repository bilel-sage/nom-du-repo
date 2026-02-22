"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export interface Idee {
  id: string;
  text: string;
  note: string;
  created_at: string;
  mode: string;
}

interface IdeesState {
  idees: Idee[];
  loading: boolean;
  fetchIdees: () => Promise<void>;
  addIdee: (text: string, note?: string) => Promise<void>;
  editIdee: (id: string, text: string, note: string) => Promise<void>;
  deleteIdee: (id: string) => Promise<void>;
}

export const useIdeesStore = create<IdeesState>((set, get) => ({
  idees: [],
  loading: false,

  fetchIdees: async () => {
    set({ loading: true });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("idees")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: false });
    if (!error) set({ idees: (data ?? []) as Idee[] });
    set({ loading: false });
  },

  addIdee: async (text, note = "") => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("idees")
      .insert({ user_id: user.id, text: text.trim(), note, mode } as any)
      .select()
      .single();
    if (!error && data) set((s) => ({ idees: [data as Idee, ...s.idees] }));
  },

  editIdee: async (id, text, note) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("idees")
      .update({ text: text.trim(), note } as any)
      .eq("id", id);
    if (!error)
      set((s) => ({
        idees: s.idees.map((i) => i.id === id ? { ...i, text: text.trim(), note } : i),
      }));
  },

  deleteIdee: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("idees").delete().eq("id", id);
    if (!error) set((s) => ({ idees: s.idees.filter((i) => i.id !== id) }));
  },
}));
