"use client";

import { useHabitStore, getToday } from "@/stores/use-habit-store";
import { Flame, Target, TrendingUp, CalendarCheck } from "lucide-react";

export function HabitStats() {
  const { habits, getStreakForHabit, getWeekProgress, isChecked } = useHabitStore();
  const today = getToday();

  const completedToday = habits.filter((h) => isChecked(h.id, today)).length;
  const totalHabits = habits.length;

  const bestStreak = Math.max(0, ...habits.map((h) => getStreakForHabit(h.id)));
  const avgWeek = totalHabits > 0
    ? Math.round(habits.reduce((sum, h) => sum + getWeekProgress(h.id), 0) / totalHabits * 100 / 7)
    : 0;

  const stats = [
    {
      label: "Aujourd'hui",
      value: `${completedToday}/${totalHabits}`,
      icon: CalendarCheck,
      color: "text-primary",
    },
    {
      label: "Meilleur streak",
      value: `${bestStreak}j`,
      icon: Flame,
      color: "text-amber-500",
    },
    {
      label: "Taux semaine",
      value: `${avgWeek}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Habitudes",
      value: `${totalHabits}`,
      icon: Target,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
