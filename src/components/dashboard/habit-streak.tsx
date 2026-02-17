"use client";

import { cn } from "@/lib/utils";
import { type DashboardHabit, type DashboardHabitLog } from "@/stores/use-dashboard-store";
import { CalendarCheck, ArrowRight, Flame, Inbox } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function calculateStreak(habitId: string, logs: DashboardHabitLog[]): number {
  const doneDates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.is_done).map((l) => l.date)
  );
  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (!doneDates.has(todayStr)) today.setDate(today.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (doneDates.has(d.toISOString().split("T")[0])) streak++;
    else break;
  }
  return streak;
}

interface HabitStreakProps {
  habits: DashboardHabit[];
  logs: DashboardHabitLog[];
}

export function HabitStreak({ habits, logs }: HabitStreakProps) {
  const today = getToday();
  const week = getLast7Days();
  const completedToday = habits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.date === today && l.is_done)
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Habitudes</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {completedToday}/{habits.length} aujourd'hui
        </span>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">Aucune habitude créée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.id, logs);
            const todayDone = logs.some(
              (l) => l.habit_id === habit.id && l.date === today && l.is_done
            );
            const weekDone = week.filter((d) =>
              logs.some((l) => l.habit_id === habit.id && l.date === d && l.is_done)
            ).length;

            return (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className={cn("text-sm", todayDone && "text-muted-foreground")}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-medium text-amber-500">
                        <Flame className="w-3 h-3" />
                        {streak}j
                      </span>
                    )}
                    {todayDone && (
                      <span className="text-[10px] text-emerald-500 font-medium">Done</span>
                    )}
                  </div>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(weekDone / 7) * 100}%`,
                      backgroundColor: habit.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/habits"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
      >
        Voir toutes les habitudes <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
