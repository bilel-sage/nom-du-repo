"use client";

import { create } from "zustand";

export type TimerPhase = "idle" | "work" | "break" | "done";
export type FocusZone = "matin" | "soir";
export type FocusMode = "learning" | "business";

export interface Ritual {
  id: string;
  label: string;
  checked: boolean;
}

// ─── localStorage helpers ────────────────────────────────────────────────────

const DEFAULT_MATIN: Omit<Ritual, "checked">[] = [
  { id: "m1", label: "Préparer notes et cahier" },
  { id: "m2", label: "Ouvrir ressources théoriques" },
  { id: "m3", label: "Relire objectifs d'apprentissage" },
  { id: "m4", label: "Couper notifications" },
  { id: "m5", label: "Mettre un casque / musique de focus" },
];

const DEFAULT_SOIR: Omit<Ritual, "checked">[] = [
  { id: "s1", label: "Ouvrir IDE / environnement de travail" },
  { id: "s2", label: "Relire les notes du matin" },
  { id: "s3", label: "Préparer exercices / projet" },
  { id: "s4", label: "Couper notifications" },
  { id: "s5", label: "Mettre un casque / musique de focus" },
];

function loadRituals(storageKey: string, zone: FocusZone): Ritual[] {
  if (typeof window === "undefined") return toRituals(zone === "matin" ? DEFAULT_MATIN : DEFAULT_SOIR);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Omit<Ritual, "checked">[];
      return parsed.map((r) => ({ ...r, checked: false }));
    }
  } catch {}
  return toRituals(zone === "matin" ? DEFAULT_MATIN : DEFAULT_SOIR);
}

function saveRituals(storageKey: string, rituals: Ritual[]) {
  if (typeof window === "undefined") return;
  const data = rituals.map(({ id, label }) => ({ id, label }));
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function toRituals(items: Omit<Ritual, "checked">[]): Ritual[] {
  return items.map((r) => ({ ...r, checked: false }));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Store state ─────────────────────────────────────────────────────────────

export interface FocusState {
  workDuration: number;
  breakDuration: number;
  totalRounds: number;

  phase: TimerPhase;
  secondsLeft: number;
  currentRound: number;
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;

  rituals: Ritual[];
  allRitualsChecked: boolean;

  // Timer settings
  setWorkDuration: (min: number) => void;
  setBreakDuration: (min: number) => void;
  setTotalRounds: (rounds: number) => void;

  // Timer actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;

  // Ritual checklist
  toggleRitual: (id: string) => void;
  resetRituals: () => void;

  // Ritual CRUD
  addRitual: (label: string) => void;
  editRitual: (id: string, label: string) => void;
  removeRitual: (id: string) => void;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getPhaseSeconds(
  phase: TimerPhase,
  state: Pick<FocusState, "workDuration" | "breakDuration">
): number {
  switch (phase) {
    case "work": return state.workDuration * 60;
    case "break": return state.breakDuration * 60;
    default: return 0;
  }
}

function getNextPhase(
  current: TimerPhase,
  currentRound: number,
  totalRounds: number
): { phase: TimerPhase; round: number } {
  if (current === "work") {
    if (currentRound >= totalRounds) return { phase: "done", round: currentRound };
    return { phase: "break", round: currentRound };
  }
  return { phase: "work", round: currentRound + 1 };
}

// ─── Store factory ────────────────────────────────────────────────────────────

function createFocusStore(zone: FocusZone, storageKey: string) {
  return create<FocusState>((set, get) => ({
    workDuration: 25,
    breakDuration: 5,
    totalRounds: 4,

    phase: "idle",
    secondsLeft: 25 * 60,
    currentRound: 1,
    isRunning: false,
    intervalId: null,

    rituals: loadRituals(storageKey, zone),
    allRitualsChecked: false,

    setWorkDuration: (min) =>
      set((s) => ({
        workDuration: min,
        secondsLeft: s.phase === "idle" || s.phase === "work" ? min * 60 : s.secondsLeft,
      })),
    setBreakDuration: (min) => set({ breakDuration: min }),
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
      const { phase: nextPhase, round: nextRound } = getNextPhase(
        s.phase,
        s.currentRound,
        s.totalRounds
      );
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
        const { phase: nextPhase, round: nextRound } = getNextPhase(
          s.phase,
          s.currentRound,
          s.totalRounds
        );
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

    toggleRitual: (id) =>
      set((s) => {
        const rituals = s.rituals.map((r) =>
          r.id === id ? { ...r, checked: !r.checked } : r
        );
        return { rituals, allRitualsChecked: rituals.every((r) => r.checked) };
      }),

    resetRituals: () =>
      set((s) => ({
        rituals: s.rituals.map((r) => ({ ...r, checked: false })),
        allRitualsChecked: false,
      })),

    addRitual: (label) => {
      if (!label.trim()) return;
      set((s) => {
        const rituals = [...s.rituals, { id: generateId(), label: label.trim(), checked: false }];
        saveRituals(storageKey, rituals);
        return { rituals };
      });
    },

    editRitual: (id, label) => {
      if (!label.trim()) return;
      set((s) => {
        const rituals = s.rituals.map((r) =>
          r.id === id ? { ...r, label: label.trim() } : r
        );
        saveRituals(storageKey, rituals);
        return { rituals };
      });
    },

    removeRitual: (id) => {
      set((s) => {
        const rituals = s.rituals.filter((r) => r.id !== id);
        saveRituals(storageKey, rituals);
        const allRitualsChecked = rituals.length > 0 && rituals.every((r) => r.checked);
        return { rituals, allRitualsChecked };
      });
    },
  }));
}

export const useFocusMatinStore         = createFocusStore("matin", "focus-rituals-matin-learning");
export const useFocusSoirStore          = createFocusStore("soir",  "focus-rituals-soir-learning");
export const useFocusMatinBusinessStore = createFocusStore("matin", "focus-rituals-matin-business");
export const useFocusSoirBusinessStore  = createFocusStore("soir",  "focus-rituals-soir-business");

export function useFocusStoreByZone(zone: FocusZone, modeKey: FocusMode) {
  if (modeKey === "business") {
    return zone === "matin" ? useFocusMatinBusinessStore : useFocusSoirBusinessStore;
  }
  return zone === "matin" ? useFocusMatinStore : useFocusSoirStore;
}
