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

// ─── Audio helpers ────────────────────────────────────────────────────────────

function playBeep(frequency = 880, duration = 0.4) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => { try { ctx.close(); } catch {} }, (duration + 0.2) * 1000);
  } catch {}
}

function sendNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {}
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

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
  localStorage.setItem(storageKey, JSON.stringify(rituals.map(({ id, label }) => ({ id, label }))));
}

function toRituals(items: Omit<Ritual, "checked">[]): Ritual[] {
  return items.map((r) => ({ ...r, checked: false }));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadWeeklyCompletions(key: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}

function saveWeeklyCompletions(key: string, dates: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(dates));
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface FocusState {
  workDuration: number;
  breakDuration: number;
  totalRounds: number;

  phase: TimerPhase;
  secondsLeft: number;
  /** Total seconds of the current phase (used for progress ring + timestamp calc) */
  phaseTotalSeconds: number;
  /** When the current phase started (absolute ms timestamp). Null when paused. */
  phaseStartTimestamp: number | null;
  currentRound: number;
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;

  rituals: Ritual[];
  allRitualsChecked: boolean;

  showDonePopup: boolean;
  weeklyCompletions: string[];

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

  // Popup
  setShowDonePopup: (v: boolean) => void;
  markTodayComplete: () => void;

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
  const weeklyKey = `${storageKey}-weekly`;

  return create<FocusState>((set, get) => ({
    workDuration: 25,
    breakDuration: 5,
    totalRounds: 4,

    phase: "idle",
    secondsLeft: 25 * 60,
    phaseTotalSeconds: 25 * 60,
    phaseStartTimestamp: null,
    currentRound: 1,
    isRunning: false,
    intervalId: null,

    rituals: loadRituals(storageKey, zone),
    allRitualsChecked: false,

    showDonePopup: false,
    weeklyCompletions: loadWeeklyCompletions(weeklyKey),

    setWorkDuration: (min) =>
      set((s) => ({
        workDuration: min,
        secondsLeft: s.phase === "idle" || s.phase === "work" ? min * 60 : s.secondsLeft,
        phaseTotalSeconds: s.phase === "idle" || s.phase === "work" ? min * 60 : s.phaseTotalSeconds,
      })),
    setBreakDuration: (min) => set({ breakDuration: min }),
    setTotalRounds: (rounds) => set({ totalRounds: rounds }),

    setShowDonePopup: (v) => set({ showDonePopup: v }),

    markTodayComplete: () => {
      const today = new Date().toISOString().split("T")[0];
      const { weeklyCompletions } = get();
      if (!weeklyCompletions.includes(today)) {
        const updated = [...weeklyCompletions, today];
        set({ weeklyCompletions: updated });
        saveWeeklyCompletions(weeklyKey, updated);
      }
    },

    start: () => {
      const s = get();
      if (s.isRunning) return;

      let phase = s.phase;
      let totalSeconds = s.phaseTotalSeconds;
      let remaining = s.secondsLeft;

      if (phase === "idle" || phase === "done") {
        phase = "work";
        totalSeconds = s.workDuration * 60;
        remaining = totalSeconds;
      }

      // Request notification permission on first start
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }

      // phaseStartTimestamp is calculated so that elapsed = totalSeconds - remaining
      const phaseStartTimestamp = Date.now() - (totalSeconds - remaining) * 1000;

      const id = setInterval(() => get().tick(), 500);
      set({ phase, secondsLeft: remaining, phaseTotalSeconds: totalSeconds, phaseStartTimestamp, isRunning: true, intervalId: id });
    },

    pause: () => {
      const { intervalId } = get();
      if (intervalId) clearInterval(intervalId);
      set({ isRunning: false, intervalId: null, phaseStartTimestamp: null });
    },

    reset: () => {
      const { intervalId, workDuration } = get();
      if (intervalId) clearInterval(intervalId);
      set({
        phase: "idle",
        secondsLeft: workDuration * 60,
        phaseTotalSeconds: workDuration * 60,
        phaseStartTimestamp: null,
        currentRound: 1,
        isRunning: false,
        intervalId: null,
        showDonePopup: false,
      });
    },

    skip: () => {
      const s = get();
      const { phase: nextPhase, round: nextRound } = getNextPhase(s.phase, s.currentRound, s.totalRounds);
      if (nextPhase === "done") {
        if (s.intervalId) clearInterval(s.intervalId);
        get().markTodayComplete();
        set({ phase: "done", isRunning: false, intervalId: null, phaseStartTimestamp: null, currentRound: nextRound, showDonePopup: true });
        playBeep(1046, 0.6);
        sendNotification("Session terminée !", "Discipline = liberté. Félicitations !");
        return;
      }
      const nextTotalSeconds = getPhaseSeconds(nextPhase, s);
      const phaseStartTimestamp = s.isRunning ? Date.now() : null;
      set({ phase: nextPhase, secondsLeft: nextTotalSeconds, phaseTotalSeconds: nextTotalSeconds, phaseStartTimestamp, currentRound: nextRound });
      playBeep(nextPhase === "break" ? 660 : 880, 0.3);
    },

    tick: () => {
      const s = get();
      if (!s.isRunning || !s.phaseStartTimestamp) return;

      const elapsed = (Date.now() - s.phaseStartTimestamp) / 1000;
      const remaining = s.phaseTotalSeconds - elapsed;

      if (remaining <= 0) {
        const { phase: nextPhase, round: nextRound } = getNextPhase(s.phase, s.currentRound, s.totalRounds);
        if (nextPhase === "done") {
          if (s.intervalId) clearInterval(s.intervalId);
          get().markTodayComplete();
          set({ secondsLeft: 0, phase: "done", isRunning: false, intervalId: null, phaseStartTimestamp: null, currentRound: nextRound, showDonePopup: true });
          playBeep(1046, 0.8);
          playBeep(880, 0.5);
          sendNotification("Session terminée !", "Discipline = liberté. Félicitations !");
          return;
        }
        const nextTotalSeconds = getPhaseSeconds(nextPhase, s);
        set({ phase: nextPhase, secondsLeft: nextTotalSeconds, phaseTotalSeconds: nextTotalSeconds, phaseStartTimestamp: Date.now(), currentRound: nextRound });
        if (nextPhase === "break") {
          playBeep(660, 0.4);
          sendNotification("Pause !", `Pause de ${s.breakDuration} min. Repose-toi.`);
        } else {
          playBeep(880, 0.3);
          sendNotification("Reprise !", `Round ${nextRound}. Concentration maximale.`);
        }
        return;
      }

      set({ secondsLeft: Math.ceil(remaining) });
    },

    toggleRitual: (id) =>
      set((s) => {
        const rituals = s.rituals.map((r) => r.id === id ? { ...r, checked: !r.checked } : r);
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
        const rituals = s.rituals.map((r) => r.id === id ? { ...r, label: label.trim() } : r);
        saveRituals(storageKey, rituals);
        return { rituals };
      });
    },

    removeRitual: (id) => {
      set((s) => {
        const rituals = s.rituals.filter((r) => r.id !== id);
        saveRituals(storageKey, rituals);
        return { rituals, allRitualsChecked: rituals.length > 0 && rituals.every((r) => r.checked) };
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
