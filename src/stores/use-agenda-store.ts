"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export const AGENDA_DAYS = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
] as const;

export type AgendaType = "ecole" | "travail";

export interface AgendaTask {
  id: string;
  agenda_type: AgendaType;
  day_index: number;
  text: string;
  time?: string;
  time_end?: string;
  done: boolean;
  mode: string;
}

// Compute human-readable duration from HH:MM start/end
export function computeDuration(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const totalMins = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMins <= 0) return null;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function groupTasks(flat: AgendaTask[]): Record<AgendaType, AgendaTask[][]> {
  const result: Record<AgendaType, AgendaTask[][]> = {
    ecole:   Array.from({ length: 7 }, () => []),
    travail: Array.from({ length: 7 }, () => []),
  };
  for (const t of flat) {
    result[t.agenda_type][t.day_index].push(t);
  }
  return result;
}

interface AgendaState {
  tasks: Record<AgendaType, AgendaTask[][]>;
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (agenda: AgendaType, day: number, text: string, time?: string, timeEnd?: string) => Promise<void>;
  editTask: (agenda: AgendaType, day: number, taskId: string, text: string, time?: string, timeEnd?: string) => Promise<void>;
  deleteTask: (agenda: AgendaType, day: number, taskId: string) => Promise<void>;
  toggleTask: (agenda: AgendaType, day: number, taskId: string) => Promise<void>;
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
  tasks: { ecole: Array.from({ length: 7 }, () => []), travail: Array.from({ length: 7 }, () => []) },
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("agenda_tasks")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: true });
    if (!error) set({ tasks: groupTasks((data ?? []) as AgendaTask[]) });
    set({ loading: false });
  },

  addTask: async (agenda, day, text, time, timeEnd) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("agenda_tasks")
      .insert({
        user_id: user.id,
        agenda_type: agenda,
        day_index: day,
        text: text.trim(),
        time: time ?? null,
        time_end: timeEnd ?? null,
        done: false,
        mode,
      } as any)
      .select()
      .single();
    if (!error && data) {
      const task = data as AgendaTask;
      set((s) => {
        const tasks = structuredClone(s.tasks);
        tasks[agenda][day].push(task);
        return { tasks };
      });
    }
  },

  editTask: async (agenda, day, taskId, text, time, timeEnd) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("agenda_tasks")
      .update({ text: text.trim(), time: time ?? null, time_end: timeEnd ?? null } as any)
      .eq("id", taskId);
    if (!error) {
      set((s) => {
        const tasks = structuredClone(s.tasks);
        tasks[agenda][day] = tasks[agenda][day].map((t) =>
          t.id === taskId ? { ...t, text: text.trim(), time, time_end: timeEnd } : t
        );
        return { tasks };
      });
    }
  },

  deleteTask: async (agenda, day, taskId) => {
    const supabase = createClient();
    const { error } = await supabase.from("agenda_tasks").delete().eq("id", taskId);
    if (!error) {
      set((s) => {
        const tasks = structuredClone(s.tasks);
        tasks[agenda][day] = tasks[agenda][day].filter((t) => t.id !== taskId);
        return { tasks };
      });
    }
  },

  toggleTask: async (agenda, day, taskId) => {
    const current = get().tasks[agenda][day].find((t) => t.id === taskId);
    if (!current) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("agenda_tasks")
      .update({ done: !current.done } as any)
      .eq("id", taskId);
    if (!error) {
      set((s) => {
        const tasks = structuredClone(s.tasks);
        tasks[agenda][day] = tasks[agenda][day].map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        return { tasks };
      });
    }
  },
}));
