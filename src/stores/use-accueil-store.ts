"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export interface Note {
  id: string;
  text: string;
  created_at: string;
  mode: string;
}

interface AccueilState {
  notes: Note[];
  loading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (text: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useAccueilStore = create<AccueilState>((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async () => {
    set({ loading: true });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: false });
    if (!error) set({ notes: (data ?? []) as Note[] });
    set({ loading: false });
  },

  addNote: async (text) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, text: text.trim(), mode } as any)
      .select()
      .single();
    if (!error && data) set((s) => ({ notes: [data as Note, ...s.notes] }));
  },

  deleteNote: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },
}));
