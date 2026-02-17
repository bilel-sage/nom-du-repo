"use client";

import { Crosshair } from "lucide-react";
import { PomodoroTimer } from "@/components/focus/pomodoro-timer";
import { RitualChecklist } from "@/components/focus/ritual-checklist";
import { TimerSettings } from "@/components/focus/timer-settings";
import { useFocusStore } from "@/stores/use-focus-store";
import { cn } from "@/lib/utils";

export default function FocusPage() {
  const { phase, isRunning } = useFocusStore();
  const isActive = phase === "work" && isRunning;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Crosshair className={cn("w-6 h-6", isActive ? "text-primary animate-pulse" : "text-primary")} />
          Focus Zone
        </h1>
        <p className="text-muted-foreground mt-1">
          Préparez-vous, concentrez-vous, dominez.
        </p>
      </div>

      {/* Main layout: Timer center + sidebars */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Left — Ritual checklist */}
        <div className="order-2 lg:order-1 rounded-xl border border-border bg-card p-5">
          <RitualChecklist />
        </div>

        {/* Center — Pomodoro timer */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className={cn(
            "rounded-2xl border bg-card p-8 md:p-10 transition-all",
            isActive
              ? "border-primary/30 shadow-lg shadow-primary/5"
              : "border-border"
          )}>
            <PomodoroTimer />
          </div>
        </div>

        {/* Right — Settings */}
        <div className="order-3 rounded-xl border border-border bg-card p-5">
          <TimerSettings />
        </div>
      </div>
    </div>
  );
}
