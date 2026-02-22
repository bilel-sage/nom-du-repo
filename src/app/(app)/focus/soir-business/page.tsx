"use client";

import { Target } from "lucide-react";
import { PomodoroTimer } from "@/components/focus/pomodoro-timer";
import { RitualChecklist } from "@/components/focus/ritual-checklist";
import { TimerSettings } from "@/components/focus/timer-settings";
import { useFocusSoirBusinessStore } from "@/stores/use-focus-store";
import { cn } from "@/lib/utils";

export default function FocusSoirBusinessPage() {
  const { phase, isRunning } = useFocusSoirBusinessStore();
  const isActive = phase === "work" && isRunning;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Target className={cn("w-6 h-6", isActive ? "text-orange-600 animate-pulse" : "text-orange-600")} />
          Focus Soir Business
        </h1>
        <p className="text-muted-foreground mt-1">
          Bilan, prospection, vision.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 lg:order-1 rounded-xl border border-border bg-card p-5">
          <RitualChecklist zone="soir" modeKey="business" />
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <div className={cn(
            "rounded-2xl border bg-card p-8 md:p-10 transition-all",
            isActive
              ? "border-orange-500/30 shadow-lg shadow-orange-500/5"
              : "border-border"
          )}>
            <PomodoroTimer zone="soir" modeKey="business" />
          </div>
        </div>

        <div className="order-3 rounded-xl border border-border bg-card p-5">
          <TimerSettings zone="soir" modeKey="business" />
        </div>
      </div>
    </div>
  );
}
