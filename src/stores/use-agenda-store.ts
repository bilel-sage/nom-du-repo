"use client";

import { create } from "zustand";

export const AGENDA_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export type AgendaType = "ecole" | "travail";

export interface AgendaTask {
  id: string;
  text: string;
  done: boolean;
  time?: string;
}

// tasks[agendaType][dayIndex] = AgendaTask[]
type AgendaTasks = Record<AgendaType, AgendaTask[][]>;

function emptyWeek(): AgendaTask[][] {
  return Array.from({ length: 7 }, () => []);
}

function loadAgenda(): AgendaTasks {
  if (typeof window === "undefined") {
    return { ecole: emptyWeek(), travail: emptyWeek() };
  }
  try {
    const raw = localStorage.getItem("agenda-tasks");
    if (!raw) return { ecole: emptyWeek(), travail: emptyWeek() };
    const parsed = JSON.parse(raw) as AgendaTasks;
    // Ensure 7 days per agenda
    if (!parsed.ecole || parsed.ecole.length !== 7) parsed.ecole = emptyWeek();
    if (!parsed.travail || parsed.travail.length !== 7) parsed.travail = emptyWeek();
    return parsed;
  } catch {
    return { ecole: emptyWeek(), travail: emptyWeek() };
  }
}

function saveAgenda(tasks: AgendaTasks) {
  if (typeof window === "undefined") return;
  localStorage.setItem("agenda-tasks", JSON.stringify(tasks));
}

interface AgendaState {
  tasks: AgendaTasks;
  addTask: (agenda: AgendaType, day: number, text: string, time?: string) => void;
  editTask: (agenda: AgendaType, day: number, taskId: string, text: string, time?: string) => void;
  deleteTask: (agenda: AgendaType, day: number, taskId: string) => void;
  toggleTask: (agenda: AgendaType, day: number, taskId: string) => void;
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
  tasks: loadAgenda(),

  addTask: (agenda, day, text, time) => {
    if (!text.trim()) return;
    const tasks = structuredClone(get().tasks);
    tasks[agenda][day].push({
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      time,
    });
    set({ tasks });
    saveAgenda(tasks);
  },

  editTask: (agenda, day, taskId, text, time) => {
    if (!text.trim()) return;
    const tasks = structuredClone(get().tasks);
    tasks[agenda][day] = tasks[agenda][day].map((t) =>
      t.id === taskId ? { ...t, text: text.trim(), time } : t
    );
    set({ tasks });
    saveAgenda(tasks);
  },

  deleteTask: (agenda, day, taskId) => {
    const tasks = structuredClone(get().tasks);
    tasks[agenda][day] = tasks[agenda][day].filter((t) => t.id !== taskId);
    set({ tasks });
    saveAgenda(tasks);
  },

  toggleTask: (agenda, day, taskId) => {
    const tasks = structuredClone(get().tasks);
    tasks[agenda][day] = tasks[agenda][day].map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    set({ tasks });
    saveAgenda(tasks);
  },
}));
