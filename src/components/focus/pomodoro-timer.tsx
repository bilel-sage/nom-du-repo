"use client";

import { useFocusStore, type TimerPhase } from "@/stores/use-focus-store";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

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
    case "longBreak": return "Pause longue";
    case "done": return "Session terminée";
  }
}

function getPhaseColor(phase: TimerPhase): string {
  switch (phase) {
    case "work": return "text-primary";
    case "break": return "text-emerald-500";
    case "longBreak": return "text-blue-500";
    case "done": return "text-amber-500";
    default: return "text-muted-foreground";
  }
}

function getPhaseRingColor(phase: TimerPhase): string {
  switch (phase) {
    case "work": return "stroke-primary";
    case "break": return "stroke-emerald-500";
    case "longBreak": return "stroke-blue-500";
    case "done": return "stroke-amber-500";
    default: return "stroke-muted-foreground/30";
  }
}

export function PomodoroTimer() {
  const {
    phase, secondsLeft, currentRound, totalRounds,
    isRunning, workDuration, breakDuration, longBreakDuration,
    start, pause, reset, skip,
  } = useFocusStore();

  // Calculate progress for the circular ring
  const totalSeconds =
    phase === "work" ? workDuration * 60
    : phase === "break" ? breakDuration * 60
    : phase === "longBreak" ? longBreakDuration * 60
    : workDuration * 60;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  // SVG circle dimensions
  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase label */}
      <div className={cn("text-sm font-semibold uppercase tracking-widest", getPhaseColor(phase))}>
        {getPhaseLabel(phase)}
      </div>

      {/* Circular timer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn("transition-all duration-1000 ease-linear", getPhaseRingColor(phase))}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold tracking-tight tabular-nums">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-muted-foreground mt-2">
            Round {currentRound} / {totalRounds}
          </span>
        </div>
      </div>

      {/* Round dots */}
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

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="w-11 h-11 rounded-full"
          onClick={reset}
        >
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
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-11 h-11 rounded-full"
          onClick={skip}
          disabled={phase === "idle" || phase === "done"}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
