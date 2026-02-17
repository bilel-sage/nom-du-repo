"use client";

import { create } from "zustand";

export type TimerPhase = "idle" | "work" | "break" | "longBreak" | "done";

export interface Ritual {
  id: string;
  label: string;
  icon: string;
  checked: boolean;
}

const DEFAULT_RITUALS: Ritual[] = [
  { id: "1", label: "Poser le téléphone en mode avion", icon: "smartphone-off", checked: false },
  { id: "2", label: "Préparer une bouteille d'eau", icon: "cup-soda", checked: false },
  { id: "3", label: "Fermer les onglets inutiles", icon: "app-window", checked: false },
  { id: "4", label: "Définir l'objectif de cette session", icon: "target", checked: false },
  { id: "5", label: "Mettre un casque / musique de focus", icon: "headphones", checked: false },
];

interface FocusState {
  // Timer settings
  workDuration: number;       // minutes
  breakDuration: number;      // minutes
  longBreakDuration: number;  // minutes
  totalRounds: number;

  // Timer state
  phase: TimerPhase;
  secondsLeft: number;
  currentRound: number;
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;

  // Rituals
  rituals: Ritual[];
  allRitualsChecked: boolean;

  // Actions — settings
  setWorkDuration: (min: number) => void;
  setBreakDuration: (min: number) => void;
  setLongBreakDuration: (min: number) => void;
  setTotalRounds: (rounds: number) => void;

  // Actions — timer
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;

  // Actions — rituals
  toggleRitual: (id: string) => void;
  resetRituals: () => void;
}

function getPhaseSeconds(phase: TimerPhase, state: Pick<FocusState, "workDuration" | "breakDuration" | "longBreakDuration">): number {
  switch (phase) {
    case "work": return state.workDuration * 60;
    case "break": return state.breakDuration * 60;
    case "longBreak": return state.longBreakDuration * 60;
    default: return 0;
  }
}

function getNextPhase(current: TimerPhase, currentRound: number, totalRounds: number): { phase: TimerPhase; round: number } {
  if (current === "work") {
    if (currentRound >= totalRounds) {
      return { phase: "done", round: currentRound };
    }
    return currentRound % 4 === 0
      ? { phase: "longBreak", round: currentRound }
      : { phase: "break", round: currentRound };
  }
  // After break or longBreak → next work round
  return { phase: "work", round: currentRound + 1 };
}

export const useFocusStore = create<FocusState>((set, get) => ({
  // Settings
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  totalRounds: 4,

  // State
  phase: "idle",
  secondsLeft: 25 * 60,
  currentRound: 1,
  isRunning: false,
  intervalId: null,

  // Rituals
  rituals: DEFAULT_RITUALS.map((r) => ({ ...r })),
  allRitualsChecked: false,

  // Settings actions
  setWorkDuration: (min) => set((s) => {
    const seconds = s.phase === "idle" || s.phase === "work" ? min * 60 : s.secondsLeft;
    return { workDuration: min, secondsLeft: seconds };
  }),
  setBreakDuration: (min) => set({ breakDuration: min }),
  setLongBreakDuration: (min) => set({ longBreakDuration: min }),
  setTotalRounds: (rounds) => set({ totalRounds: rounds }),

  // Timer actions
  start: () => {
    const s = get();
    if (s.isRunning) return;

    let phase = s.phase;
    let seconds = s.secondsLeft;

    if (phase === "idle" || phase === "done") {
      phase = "work";
      seconds = s.workDuration * 60;
    }

    const id = setInterval(() => get().tick(), 1000);
    set({ phase, secondsLeft: seconds, isRunning: true, intervalId: id });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },

  reset: () => {
    const { intervalId, workDuration } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      phase: "idle",
      secondsLeft: workDuration * 60,
      currentRound: 1,
      isRunning: false,
      intervalId: null,
    });
  },

  skip: () => {
    const s = get();
    const { phase: nextPhase, round: nextRound } = getNextPhase(s.phase, s.currentRound, s.totalRounds);

    if (nextPhase === "done") {
      if (s.intervalId) clearInterval(s.intervalId);
      set({ phase: "done", isRunning: false, intervalId: null, currentRound: nextRound });
      return;
    }

    const nextSeconds = getPhaseSeconds(nextPhase, s);
    set({ phase: nextPhase, secondsLeft: nextSeconds, currentRound: nextRound });
  },

  tick: () => {
    const s = get();
    if (s.secondsLeft <= 1) {
      // Phase complete — auto-transition
      const { phase: nextPhase, round: nextRound } = getNextPhase(s.phase, s.currentRound, s.totalRounds);

      if (nextPhase === "done") {
        if (s.intervalId) clearInterval(s.intervalId);
        set({ secondsLeft: 0, phase: "done", isRunning: false, intervalId: null, currentRound: nextRound });
        // Play notification sound
        if (typeof window !== "undefined") {
          try { new Audio("/notification.mp3").play(); } catch {}
        }
        return;
      }

      const nextSeconds = getPhaseSeconds(nextPhase, s);
      set({ phase: nextPhase, secondsLeft: nextSeconds, currentRound: nextRound });

      // Notify phase change
      if (typeof window !== "undefined") {
        try { new Audio("/notification.mp3").play(); } catch {}
      }
      return;
    }

    set({ secondsLeft: s.secondsLeft - 1 });
  },

  // Ritual actions
  toggleRitual: (id) => set((s) => {
    const rituals = s.rituals.map((r) =>
      r.id === id ? { ...r, checked: !r.checked } : r
    );
    return { rituals, allRitualsChecked: rituals.every((r) => r.checked) };
  }),

  resetRituals: () => set({
    rituals: DEFAULT_RITUALS.map((r) => ({ ...r })),
    allRitualsChecked: false,
  }),
}));
