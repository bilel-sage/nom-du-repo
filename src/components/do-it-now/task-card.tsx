"use client";

import { type Task, type TaskSession, useDoItNowStore } from "@/stores/use-doitnow-store";
import { Button } from "@/components/ui/button";
import { Play, Square, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface TaskCardProps {
  task: Task;
  sessions: TaskSession[];
}

export function TaskCard({ task, sessions }: TaskCardProps) {
  const { activeTimer, startTimer, stopTimer, deleteTask } = useDoItNowStore();
  const isActive = activeTimer?.taskId === task.id;
  const hasActiveTimer = activeTimer !== null;

  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => s.skill_id === task.id && s.started_at.startsWith(today))
    .reduce((sum, s) => sum + s.duration_min, 0);

  const totalHours = Math.floor(task.total_minutes / 60);
  const totalMin = task.total_minutes % 60;

  const recentSessions = sessions
    .filter((s) => s.skill_id === task.id)
    .slice(0, 5);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 space-y-4 transition-all",
        isActive
          ? "border-primary/40 shadow-lg shadow-primary/5"
          : "border-border hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: task.color }}
          >
            {task.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{task.name}</h3>
            <p className="text-xs text-muted-foreground">
              {totalHours > 0
                ? `${totalHours}h ${totalMin > 0 ? `${totalMin}min` : ""} au total`
                : `${task.total_minutes}min au total`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => deleteTask(task.id)}
          disabled={isActive}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Today stat */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>
          Aujourd'hui :{" "}
          <strong className="text-foreground">{formatDuration(todayMinutes)}</strong>
        </span>
      </div>

      {/* Timer */}
      {isActive ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-2xl font-mono font-bold tabular-nums text-primary">
              {formatElapsed(activeTimer.elapsed)}
            </span>
          </div>
          <Button size="sm" variant="destructive" className="gap-1.5" onClick={stopTimer}>
            <Square className="w-3.5 h-3.5" />
            Arrêter
          </Button>
        </div>
      ) : (
        <Button
          className="w-full gap-2"
          onClick={() => startTimer(task.id)}
          disabled={hasActiveTimer}
          style={{ backgroundColor: hasActiveTimer ? undefined : task.color }}
        >
          <Play className="w-4 h-4" />
          Lancer le chrono
        </Button>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Sessions récentes
          </p>
          {recentSessions.map((session) => {
            const date = new Date(session.started_at);
            return (
              <div
                key={session.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                <span className="font-mono">{formatDuration(session.duration_min)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
