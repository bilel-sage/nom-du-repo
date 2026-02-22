import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppMode = "learning" | "business";

interface ModeState {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

function detectDefaultMode(): AppMode {
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6 ? "business" : "learning";
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: detectDefaultMode(),
      setMode: (m) => set({ mode: m }),
    }),
    {
      name: "app-mode",
    }
  )
);
