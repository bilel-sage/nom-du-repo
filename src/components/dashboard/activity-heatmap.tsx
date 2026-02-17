"use client";

import { cn } from "@/lib/utils";
import { type DashboardDeepworkSession } from "@/stores/use-dashboard-store";
import { Flame } from "lucide-react";
import { useMemo } from "react";

function getIntensity(minutes: number): string {
  if (minutes === 0) return "bg-muted/50";
  if (minutes < 30) return "bg-primary/20";
  if (minutes < 60) return "bg-primary/40";
  if (minutes < 120) return "bg-primary/60";
  return "bg-primary";
}

interface ActivityHeatmapProps {
  sessions: DashboardDeepworkSession[];
}

export function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  const data = useMemo(() => {
    // Build a map of date → total minutes from real sessions
    const dateMap = new Map<string, number>();
    sessions.forEach((s) => {
      const date = s.started_at.split("T")[0];
      dateMap.set(date, (dateMap.get(date) ?? 0) + s.duration_min);
    });

    // Generate last 84 days (12 weeks)
    const days: { date: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, minutes: dateMap.get(dateStr) ?? 0 });
    }
    return days;
  }, [sessions]);

  // Group into weeks
  const weeks: { date: string; minutes: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = data.filter((d) => d.minutes > 0).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Activité Deepwork</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{Math.floor(totalMinutes / 60)}h</strong> total</span>
          <span><strong className="text-foreground">{activeDays}</strong> jours actifs</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "w-3 h-3 rounded-sm transition-colors",
                  getIntensity(day.minutes)
                )}
                title={`${day.date}: ${day.minutes}min`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-muted/50" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Plus</span>
      </div>
    </div>
  );
}
