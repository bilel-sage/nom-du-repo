"use client";

import { useEffect } from "react";
import { useHabitStore } from "@/stores/use-habit-store";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { HabitStats } from "@/components/habits/habit-stats";
import { CalendarCheck, Loader2 } from "lucide-react";

export default function HabitsPage() {
  const { loading, fetchHabits, fetchLogs } = useHabitStore();

  useEffect(() => {
    fetchHabits().then(() => fetchLogs(30));
  }, [fetchHabits, fetchLogs]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          Habitudes
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Construisez la discipline, pilier par pilier.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <HabitStats />
          <HabitTracker />
        </>
      )}
    </div>
  );
}
