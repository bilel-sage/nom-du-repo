"use client";

import { create } from "zustand";

export interface Objectif {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  done: boolean;
  createdAt: string;
}

function load(): Objectif[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("objectifs") ?? "[]"); }
  catch { return []; }
}
function save(data: Objectif[]) {
  if (typeof window !== "undefined") localStorage.setItem("objectifs", JSON.stringify(data));
}

interface ObjectifsState {
  objectifs: Objectif[];
  addObjectif: (title: string, deadline: string) => void;
  toggleObjectif: (id: string) => void;
  deleteObjectif: (id: string) => void;
  editObjectif: (id: string, title: string, deadline: string) => void;
}

export const useObjectifsStore = create<ObjectifsState>((set, get) => ({
  objectifs: load(),

  addObjectif: (title, deadline) => {
    if (!title.trim()) return;
    const item: Objectif = {
      id: crypto.randomUUID(),
      title: title.trim(),
      deadline,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const objectifs = [...get().objectifs, item];
    set({ objectifs });
    save(objectifs);
  },

  toggleObjectif: (id) => {
    const objectifs = get().objectifs.map((o) => o.id === id ? { ...o, done: !o.done } : o);
    set({ objectifs });
    save(objectifs);
  },

  deleteObjectif: (id) => {
    const objectifs = get().objectifs.filter((o) => o.id !== id);
    set({ objectifs });
    save(objectifs);
  },

  editObjectif: (id, title, deadline) => {
    const objectifs = get().objectifs.map((o) => o.id === id ? { ...o, title: title.trim(), deadline } : o);
    set({ objectifs });
    save(objectifs);
  },
}));
