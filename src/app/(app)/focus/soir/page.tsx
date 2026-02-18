"use client";

import { Sunset } from "lucide-react";
import { PomodoroTimer } from "@/components/focus/pomodoro-timer";
import { RitualChecklist } from "@/components/focus/ritual-checklist";
import { TimerSettings } from "@/components/focus/timer-settings";
import { useFocusSoirStore } from "@/stores/use-focus-store";
import { cn } from "@/lib/utils";

export default function FocusSoirPage() {
  const { phase, isRunning } = useFocusSoirStore();
  const isActive = phase === "work" && isRunning;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sunset className={cn("w-6 h-6", isActive ? "text-indigo-500 animate-pulse" : "text-indigo-500")} />
          Focus Soir
        </h1>
        <p className="text-muted-foreground mt-1">
          Mise en application, exercices, pratique active.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 lg:order-1 rounded-xl border border-border bg-card p-5">
          <RitualChecklist zone="soir" />
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <div className={cn(
            "rounded-2xl border bg-card p-8 md:p-10 transition-all",
            isActive
              ? "border-indigo-500/30 shadow-lg shadow-indigo-500/5"
              : "border-border"
          )}>
            <PomodoroTimer zone="soir" />
          </div>
        </div>

        <div className="order-3 rounded-xl border border-border bg-card p-5">
          <TimerSettings zone="soir" />
        </div>
      </div>
    </div>
  );
}
