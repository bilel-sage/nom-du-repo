"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export interface Objectif {
  id: string;
  title: string;
  deadline: string;
  done: boolean;
  created_at: string;
  mode: string;
}

interface ObjectifsState {
  objectifs: Objectif[];
  loading: boolean;
  fetchObjectifs: () => Promise<void>;
  addObjectif: (title: string, deadline: string) => Promise<void>;
  toggleObjectif: (id: string) => Promise<void>;
  deleteObjectif: (id: string) => Promise<void>;
  editObjectif: (id: string, title: string, deadline: string) => Promise<void>;
}

export const useObjectifsStore = create<ObjectifsState>((set, get) => ({
  objectifs: [],
  loading: false,

  fetchObjectifs: async () => {
    set({ loading: true });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("objectifs")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: true });
    if (!error) set({ objectifs: (data ?? []) as Objectif[] });
    set({ loading: false });
  },

  addObjectif: async (title, deadline) => {
    if (!title.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("objectifs")
      .insert({ user_id: user.id, title: title.trim(), deadline, done: false, mode } as any)
      .select()
      .single();
    if (!error && data) set((s) => ({ objectifs: [...s.objectifs, data as Objectif] }));
  },

  toggleObjectif: async (id) => {
    const obj = get().objectifs.find((o) => o.id === id);
    if (!obj) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("objectifs")
      .update({ done: !obj.done } as any)
      .eq("id", id);
    if (!error)
      set((s) => ({
        objectifs: s.objectifs.map((o) => o.id === id ? { ...o, done: !o.done } : o),
      }));
  },

  deleteObjectif: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("objectifs").delete().eq("id", id);
    if (!error) set((s) => ({ objectifs: s.objectifs.filter((o) => o.id !== id) }));
  },

  editObjectif: async (id, title, deadline) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("objectifs")
      .update({ title: title.trim(), deadline } as any)
      .eq("id", id);
    if (!error)
      set((s) => ({
        objectifs: s.objectifs.map((o) => o.id === id ? { ...o, title: title.trim(), deadline } : o),
      }));
  },
}));
