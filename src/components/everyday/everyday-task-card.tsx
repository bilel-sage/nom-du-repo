"use client";

import { useEverydayStore, type EverydayTask, type EverydaySession } from "@/stores/use-everyday-store";
import { Button } from "@/components/ui/button";
import { Play, Square, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ─── Progress ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  active?: boolean;
  done?: boolean;
}

function ProgressRing({ progress, size = 56, strokeWidth = 4, active, done }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor"
        className="text-border" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        className={cn(
          "transition-all duration-500",
          done ? "stroke-emerald-500" : active ? "stroke-primary" : "stroke-muted-foreground/30"
        )}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface EverydayTaskCardProps {
  task: EverydayTask;
  sessions: EverydaySession[];
}

export function EverydayTaskCard({ task, sessions }: EverydayTaskCardProps) {
  const { activeTimerData, secondsLeft, startTimer, stopTimer } = useEverydayStore();

  const isActive = activeTimerData?.taskId === task.id;
  const otherActive = !!activeTimerData && !isActive;

  // A task is "done" if there's a completed session for today
  const isDone = sessions.some((s) => s.task_id === task.id && s.completed);

  const targetSeconds = task.duration * 60;
  const elapsed = isActive ? targetSeconds - secondsLeft : isDone ? targetSeconds : 0;
  const progress = targetSeconds > 0 ? elapsed / targetSeconds : 0;

  const displaySeconds = isActive ? secondsLeft : isDone ? 0 : targetSeconds;

  return (
    <div className={cn(
      "relative flex flex-col gap-4 p-5 rounded-xl border transition-all duration-300",
      isActive
        ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
        : isDone
        ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
        : "border-border bg-card hover:border-border/80"
    )}>
      {/* Top row: emoji + title + ring */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl leading-none">{task.emoji}</span>
            <span className={cn(
              "font-semibold text-base",
              isDone ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </span>
            {isDone && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Fait
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDuration(task.duration)}
            {isActive && (
              <span className="ml-2 text-primary font-mono font-semibold">
                {formatTime(displaySeconds)} restant
              </span>
            )}
            {isDone && (
              <span className="ml-2 text-emerald-600 font-medium">Session complétée ✓</span>
            )}
          </p>
        </div>

        {/* Progress ring */}
        <div className="relative shrink-0">
          <ProgressRing progress={progress} active={isActive} done={isDone} />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          )}
          {isDone && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
      </div>

      {/* Timer bar (only when active) */}
      {isActive && (
        <div className="h-1.5 rounded-full bg-primary/15 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
      )}

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={stopTimer}
            >
              <Square className="w-3.5 h-3.5" />
              Arrêter
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={otherActive}
              onClick={() => startTimer(task.id)}
            >
              <Play className="w-3.5 h-3.5 ml-0.5" />
              Lancer
            </Button>
          )}

          {otherActive && !isActive && (
            <p className="text-xs text-muted-foreground">Session en cours ailleurs</p>
          )}
        </div>
      )}
    </div>
  );
}
