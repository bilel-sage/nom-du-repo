"use client";

import { useEffect } from "react";
import { useEverydayStore, EVERYDAY_TASKS } from "@/stores/use-everyday-store";
import { EverydayTaskCard } from "@/components/everyday/everyday-task-card";
import { CalendarCheck, Loader2 } from "lucide-react";

function getTodayLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function EverydayPage() {
  const { todaySessions, loading, fetchTodaySessions, resumeIfActive, activeTimerData } = useEverydayStore();

  useEffect(() => {
    fetchTodaySessions();
    resumeIfActive();
  }, [fetchTodaySessions, resumeIfActive]);

  // Handle tab visibility changes — resume/complete timer when coming back
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        resumeIfActive();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [resumeIfActive]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      const { intervalId } = useEverydayStore.getState();
      if (intervalId) clearInterval(intervalId);
      useEverydayStore.setState({ intervalId: null });
    };
  }, []);

  const completedCount = EVERYDAY_TASKS.filter((task) =>
    todaySessions.some((s) => s.task_id === task.id && s.completed)
  ).length;

  const progressPct = Math.round((completedCount / EVERYDAY_TASKS.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          Everyday
        </h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">{getTodayLabel()}</p>
      </div>

      {/* Daily progress */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Progression du jour</p>
          <span className="text-sm font-mono font-bold text-primary">
            {completedCount} / {EVERYDAY_TASKS.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {completedCount === EVERYDAY_TASKS.length && (
          <p className="text-sm text-emerald-600 font-semibold text-center">
            Toutes les sessions complétées. Bravo ! 🎉
          </p>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {EVERYDAY_TASKS.map((task) => (
            <EverydayTaskCard
              key={task.id}
              task={task}
              sessions={todaySessions}
            />
          ))}
        </div>
      )}

      {/* Active session info */}
      {activeTimerData && (
        <p className="text-xs text-center text-muted-foreground">
          Le chrono continue même si vous changez d'onglet ou fermez l'app.
        </p>
      )}
    </div>
  );
}
