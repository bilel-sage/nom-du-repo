"use client";

import { useEffect } from "react";
import { type TimerPhase, type FocusZone, type FocusMode, useFocusStoreByZone } from "@/stores/use-focus-store";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionDonePopup } from "@/components/focus/session-done-popup";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case "idle": return "Prêt";
    case "work": return "Focus";
    case "break": return "Pause";
    case "done": return "Session terminée";
  }
}

function getPhaseColor(phase: TimerPhase): string {
  switch (phase) {
    case "work": return "text-primary";
    case "break": return "text-emerald-500";
    case "done": return "text-amber-500";
    default: return "text-muted-foreground";
  }
}

function getPhaseRingColor(phase: TimerPhase): string {
  switch (phase) {
    case "work": return "stroke-primary";
    case "break": return "stroke-emerald-500";
    case "done": return "stroke-amber-500";
    default: return "stroke-muted-foreground/30";
  }
}

// ─── Weekly band ──────────────────────────────────────────────────────────────

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  // Monday-first week: find the Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

interface WeeklyBandProps {
  completions: string[];
}

function WeeklyBand({ completions }: WeeklyBandProps) {
  const weekDates = getWeekDates();
  const today = getTodayStr();
  const completionSet = new Set(completions);

  return (
    <div className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center mb-2">
        Semaine
      </p>
      <div className="flex items-center justify-center gap-1.5">
        {DAY_LABELS.map((label, i) => {
          const date = weekDates[i];
          const done = completionSet.has(date);
          const isToday = date === today;
          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className={cn(
                "text-[10px] font-medium",
                isToday ? "text-foreground" : "text-muted-foreground"
              )}>
                {label}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                done
                  ? "bg-primary text-primary-foreground border-primary"
                  : isToday
                  ? "border-primary/50 text-muted-foreground"
                  : "border-border text-muted-foreground"
              )}>
                {done ? "✓" : "·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PomodoroTimerProps {
  zone: FocusZone;
  modeKey: FocusMode;
}

export function PomodoroTimer({ zone, modeKey }: PomodoroTimerProps) {
  const useStore = useFocusStoreByZone(zone, modeKey);
  const {
    phase, secondsLeft, currentRound, totalRounds,
    isRunning, workDuration, breakDuration,
    weeklyCompletions,
    start, pause, reset, skip, tick,
  } = useStore();

  // When the tab becomes visible again, immediately recalculate from the
  // absolute timestamp so the display is accurate after backgrounding/sleep.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [tick]);

  const { phaseTotalSeconds } = useStore();
  const totalSeconds = phaseTotalSeconds > 0 ? phaseTotalSeconds : workDuration * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <>
      <SessionDonePopup zone={zone} modeKey={modeKey} />

      <div className="flex flex-col items-center gap-6 w-full">
        <div className={cn("text-sm font-semibold uppercase tracking-widest", getPhaseColor(phase))}>
          {getPhaseLabel(phase)}
        </div>

        {/* Cercle timer */}
        <div className="relative w-full max-w-[280px] aspect-square mx-auto">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="currentColor"
              className="text-border" strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              className={cn("transition-all duration-1000 ease-linear", getPhaseRingColor(phase))}
              strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight tabular-nums">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs text-muted-foreground mt-2">
              Round {currentRound} / {totalRounds}
            </span>
          </div>
        </div>

        {/* Indicateurs de rounds */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i < currentRound - 1
                  ? "bg-primary"
                  : i === currentRound - 1 && phase === "work"
                  ? "bg-primary animate-pulse"
                  : "bg-border"
              )}
            />
          ))}
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="w-11 h-11 rounded-full" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all",
              phase === "work" && isRunning && "shadow-primary/25"
            )}
            onClick={isRunning ? pause : start}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>

          <Button
            variant="outline" size="icon" className="w-11 h-11 rounded-full"
            onClick={skip}
            disabled={phase === "idle" || phase === "done"}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Bande hebdomadaire */}
        <WeeklyBand completions={weeklyCompletions} />
      </div>
    </>
  );
}
