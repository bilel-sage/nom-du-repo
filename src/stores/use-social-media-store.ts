"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Creator {
  id: string;
  name: string;
  tiktok?: string;
  reddit?: string;
  twitter?: string;
  youtube?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface SocialMediaState {
  creators: Creator[];
  addCreator: (creator: Omit<Creator, "id">) => void;
  updateCreator: (id: string, updates: Partial<Omit<Creator, "id">>) => void;
  deleteCreator: (id: string) => void;
}

export const useSocialMediaStore = create<SocialMediaState>()(
  persist(
    (set) => ({
      creators: [],

      addCreator: (creator) => {
        set((s) => ({
          creators: [...s.creators, { ...creator, id: generateId() }],
        }));
      },

      updateCreator: (id, updates) => {
        set((s) => ({
          creators: s.creators.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCreator: (id) => {
        set((s) => ({ creators: s.creators.filter((c) => c.id !== id) }));
      },
    }),
    { name: "biproductive-social-media" }
  )
);
