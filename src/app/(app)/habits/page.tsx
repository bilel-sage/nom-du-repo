"use client";

import { useEffect } from "react";
import { useHabitStore } from "@/stores/use-habit-store";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { HabitStats } from "@/components/habits/habit-stats";
import { CalendarCheck, Loader2, Inbox } from "lucide-react";

export default function HabitsPage() {
  const { habits, loading, fetchHabits, fetchLogs } = useHabitStore();

  useEffect(() => {
    fetchHabits().then(() => fetchLogs(30));
  }, [fetchHabits, fetchLogs]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" />
            Habitudes
          </h1>
          <p className="text-muted-foreground mt-1">
            Construisez la discipline, jour après jour.
          </p>
        </div>
        <HabitDialog />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune habitude. Créez votre première routine.
          </p>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <HabitStats />

          {/* Week tracker grid */}
          <HabitTracker />

          <p className="text-xs text-muted-foreground text-center">
            Cliquez sur une case pour cocher/décocher un jour. Les streaks sont calculés automatiquement.
          </p>
        </>
      )}
    </div>
  );
}
