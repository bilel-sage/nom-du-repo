"use client";

import { create } from "zustand";

export interface Idee {
  id: string;
  text: string;
  note: string;
  createdAt: string;
}

function load(): Idee[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("idees-business") ?? "[]"); }
  catch { return []; }
}
function save(data: Idee[]) {
  if (typeof window !== "undefined") localStorage.setItem("idees-business", JSON.stringify(data));
}

interface IdeesState {
  idees: Idee[];
  addIdee: (text: string, note?: string) => void;
  editIdee: (id: string, text: string, note: string) => void;
  deleteIdee: (id: string) => void;
}

export const useIdeesStore = create<IdeesState>((set, get) => ({
  idees: load(),

  addIdee: (text, note = "") => {
    if (!text.trim()) return;
    const item: Idee = {
      id: crypto.randomUUID(),
      text: text.trim(),
      note,
      createdAt: new Date().toISOString(),
    };
    const idees = [item, ...get().idees];
    set({ idees });
    save(idees);
  },

  editIdee: (id, text, note) => {
    const idees = get().idees.map((i) => i.id === id ? { ...i, text: text.trim(), note } : i);
    set({ idees });
    save(idees);
  },

  deleteIdee: (id) => {
    const idees = get().idees.filter((i) => i.id !== id);
    set({ idees });
    save(idees);
  },
}));
