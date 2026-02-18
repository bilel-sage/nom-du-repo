"use client";

import { create } from "zustand";

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

function load(): Note[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("vide-tete-notes") ?? "[]"); }
  catch { return []; }
}
function save(notes: Note[]) {
  if (typeof window !== "undefined") localStorage.setItem("vide-tete-notes", JSON.stringify(notes));
}

interface AccueilState {
  notes: Note[];
  addNote: (text: string) => void;
  deleteNote: (id: string) => void;
}

export const useAccueilStore = create<AccueilState>((set, get) => ({
  notes: load(),

  addNote: (text) => {
    if (!text.trim()) return;
    const note: Note = { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() };
    const notes = [note, ...get().notes];
    set({ notes });
    save(notes);
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    set({ notes });
    save(notes);
  },
}));
