"use client";

import { create } from "zustand";

export type TimerPhase = "idle" | "work" | "break" | "longBreak" | "done";
export type FocusZone = "matin" | "soir";

export interface Ritual {
  id: string;
  label: string;
  icon: string;
  checked: boolean;
}

const MATIN_RITUALS: Ritual[] = [
  { id: "m1", label: "Préparer notes et cahier", icon: "notebook-pen", checked: false },
  { id: "m2", label: "Ouvrir ressources théoriques", icon: "book-open", checked: false },
  { id: "m3", label: "Relire objectifs d'apprentissage", icon: "target", checked: false },
  { id: "m4", label: "Couper notifications", icon: "smartphone-off", checked: false },
  { id: "m5", label: "Mettre un casque / musique de focus", icon: "headphones", checked: false },
];

const SOIR_RITUALS: Ritual[] = [
  { id: "s1", label: "Ouvrir IDE / environnement de travail", icon: "code", checked: false },
  { id: "s2", label: "Relire les notes du matin", icon: "notebook-pen", checked: false },
  { id: "s3", label: "Préparer exercices / projet", icon: "target", checked: false },
  { id: "s4", label: "Couper notifications", icon: "smartphone-off", checked: false },
  { id: "s5", label: "Mettre un casque / musique de focus", icon: "headphones", checked: false },
];

export interface FocusState {
  // Timer settings
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
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
  return { phase: "work", round: currentRound + 1 };
}

function createFocusStore(defaultRituals: Ritual[]) {
  return create<FocusState>((set, get) => ({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    totalRounds: 4,

    phase: "idle",
    secondsLeft: 25 * 60,
    currentRound: 1,
    isRunning: false,
    intervalId: null,

    rituals: defaultRituals.map((r) => ({ ...r })),
    allRitualsChecked: false,

    setWorkDuration: (min) => set((s) => {
      const seconds = s.phase === "idle" || s.phase === "work" ? min * 60 : s.secondsLeft;
      return { workDuration: min, secondsLeft: seconds };
    }),
    setBreakDuration: (min) => set({ breakDuration: min }),
    setLongBreakDuration: (min) => set({ longBreakDuration: min }),
    setTotalRounds: (rounds) => set({ totalRounds: rounds }),

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
        const { phase: nextPhase, round: nextRound } = getNextPhase(s.phase, s.currentRound, s.totalRounds);

        if (nextPhase === "done") {
          if (s.intervalId) clearInterval(s.intervalId);
          set({ secondsLeft: 0, phase: "done", isRunning: false, intervalId: null, currentRound: nextRound });
          if (typeof window !== "undefined") {
            try { new Audio("/notification.mp3").play(); } catch {}
          }
          return;
        }

        const nextSeconds = getPhaseSeconds(nextPhase, s);
        set({ phase: nextPhase, secondsLeft: nextSeconds, currentRound: nextRound });

        if (typeof window !== "undefined") {
          try { new Audio("/notification.mp3").play(); } catch {}
        }
        return;
      }

      set({ secondsLeft: s.secondsLeft - 1 });
    },

    toggleRitual: (id) => set((s) => {
      const rituals = s.rituals.map((r) =>
        r.id === id ? { ...r, checked: !r.checked } : r
      );
      return { rituals, allRitualsChecked: rituals.every((r) => r.checked) };
    }),

    resetRituals: () => set({
      rituals: defaultRituals.map((r) => ({ ...r })),
      allRitualsChecked: false,
    }),
  }));
}

export const useFocusMatinStore = createFocusStore(MATIN_RITUALS);
export const useFocusSoirStore = createFocusStore(SOIR_RITUALS);

export function useFocusStoreByZone(zone: FocusZone) {
  return zone === "matin" ? useFocusMatinStore : useFocusSoirStore;
}
