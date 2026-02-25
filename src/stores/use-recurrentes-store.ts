"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecurringTask {
  id: string;
  name: string;
  duration: number; // minutes
  frequency: "daily" | "weekly";
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface RecurrentesState {
  tasks: RecurringTask[];
  addTask: (task: Omit<RecurringTask, "id" | "completedDates">) => void;
  updateTask: (id: string, updates: Partial<Omit<RecurringTask, "id" | "completedDates">>) => void;
  deleteTask: (id: string) => void;
  toggleToday: (id: string) => void;
  isCompletedToday: (id: string) => boolean;
  getCompletionRate: (id: string, days?: number) => number;
}

export const useRecurrentesStore = create<RecurrentesState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: generateId(), completedDates: [] }],
        }));
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      toggleToday: (id) => {
        const today = getToday();
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const alreadyDone = t.completedDates.includes(today);
            return {
              ...t,
              completedDates: alreadyDone
                ? t.completedDates.filter((d) => d !== today)
                : [...t.completedDates, today],
            };
          }),
        }));
      },

      isCompletedToday: (id) => {
        const today = getToday();
        return get().tasks.find((t) => t.id === id)?.completedDates.includes(today) ?? false;
      },

      getCompletionRate: (id, days = 7) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return 0;
        let count = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          if (task.completedDates.includes(dateStr)) count++;
        }
        return Math.round((count / days) * 100);
      },
    }),
    { name: "biproductive-recurrentes" }
  )
);
