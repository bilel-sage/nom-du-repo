"use client";

import { create } from "zustand";

export type RitualZone = "matin" | "soir";

export interface RitualItem {
  id: string;
  text: string;
  done: boolean;
}

type RitualsData = Record<RitualZone, RitualItem[]>;

function load(): RitualsData {
  if (typeof window === "undefined") return { matin: [], soir: [] };
  try {
    const raw = localStorage.getItem("rituels-data");
    if (!raw) return { matin: [], soir: [] };
    return JSON.parse(raw);
  } catch { return { matin: [], soir: [] }; }
}
function save(data: RitualsData) {
  if (typeof window !== "undefined") localStorage.setItem("rituels-data", JSON.stringify(data));
}

interface RituelsState {
  rituals: RitualsData;
  addRitual: (zone: RitualZone, text: string) => void;
  editRitual: (zone: RitualZone, id: string, text: string) => void;
  deleteRitual: (zone: RitualZone, id: string) => void;
  toggleRitual: (zone: RitualZone, id: string) => void;
  resetZone: (zone: RitualZone) => void;
}

export const useRituelsStore = create<RituelsState>((set, get) => ({
  rituals: load(),

  addRitual: (zone, text) => {
    if (!text.trim()) return;
    const item: RitualItem = { id: crypto.randomUUID(), text: text.trim(), done: false };
    const rituals = { ...get().rituals, [zone]: [...get().rituals[zone], item] };
    set({ rituals });
    save(rituals);
  },

  editRitual: (zone, id, text) => {
    if (!text.trim()) return;
    const rituals = {
      ...get().rituals,
      [zone]: get().rituals[zone].map((r) => r.id === id ? { ...r, text: text.trim() } : r),
    };
    set({ rituals });
    save(rituals);
  },

  deleteRitual: (zone, id) => {
    const rituals = { ...get().rituals, [zone]: get().rituals[zone].filter((r) => r.id !== id) };
    set({ rituals });
    save(rituals);
  },

  toggleRitual: (zone, id) => {
    const rituals = {
      ...get().rituals,
      [zone]: get().rituals[zone].map((r) => r.id === id ? { ...r, done: !r.done } : r),
    };
    set({ rituals });
    save(rituals);
  },

  resetZone: (zone) => {
    const rituals = { ...get().rituals, [zone]: get().rituals[zone].map((r) => ({ ...r, done: false })) };
    set({ rituals });
    save(rituals);
  },
}));
