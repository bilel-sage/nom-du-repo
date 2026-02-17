"use client";

import { useHabitStore, getLast7Days, getToday } from "@/stores/use-habit-store";
import { Button } from "@/components/ui/button";
import { Flame, Trash2, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_LABELS[d.getDay()];
}

function getDayNumber(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").getDate().toString();
}

export function HabitTracker() {
  const { habits, toggleDay, isChecked, getStreakForHabit, getWeekProgress, deleteHabit } = useHabitStore();
  const days = getLast7Days();
  const today = getToday();

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header row with day columns */}
      <div className="grid items-center gap-0 border-b border-border bg-muted/30"
        style={{ gridTemplateColumns: "1fr repeat(7, 48px) 80px" }}
      >
        <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Habitude
        </div>
        {days.map((d) => (
          <div
            key={d}
            className={cn(
              "text-center py-3",
              d === today && "bg-primary/5"
            )}
          >
            <div className="text-[10px] text-muted-foreground">{getDayLabel(d)}</div>
            <div className={cn(
              "text-xs font-medium",
              d === today ? "text-primary" : "text-foreground"
            )}>
              {getDayNumber(d)}
            </div>
          </div>
        ))}
        <div className="px-3 py-3 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Streak
        </div>
      </div>

      {/* Habit rows */}
      {habits.map((habit) => {
        const streak = getStreakForHabit(habit.id);
        const weekDone = getWeekProgress(habit.id);

        return (
          <div
            key={habit.id}
            className="group grid items-center gap-0 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors"
            style={{ gridTemplateColumns: "1fr repeat(7, 48px) 80px" }}
          >
            {/* Habit name + meta */}
            <div className="flex items-center gap-3 px-4 py-3 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: habit.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{habit.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    +{habit.xp_per_check}
                  </span>
                  <span>{weekDone}/7 cette semaine</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => deleteHabit(habit.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Day checkboxes */}
            {days.map((d) => {
              const checked = isChecked(habit.id, d);
              return (
                <div
                  key={d}
                  className={cn(
                    "flex items-center justify-center py-3",
                    d === today && "bg-primary/5"
                  )}
                >
                  <button
                    onClick={() => toggleDay(habit.id, d)}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                      checked
                        ? "text-white scale-100"
                        : "border border-border hover:border-foreground/30 hover:scale-105"
                    )}
                    style={checked ? { backgroundColor: habit.color } : undefined}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}

            {/* Streak */}
            <div className="flex items-center justify-center gap-1 px-3 py-3">
              {streak > 0 ? (
                <span className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  streak >= 7 ? "text-amber-500" : "text-muted-foreground"
                )}>
                  <Flame className={cn(
                    "w-4 h-4",
                    streak >= 7 ? "text-amber-500" : "text-muted-foreground"
                  )} />
                  {streak}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Summary footer */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{habits.length} habitude{habits.length > 1 ? "s" : ""} actives</span>
          <span>
            {habits.filter((h) => isChecked(h.id, today)).length}/{habits.length} complétées aujourd'hui
          </span>
        </div>
      </div>
    </div>
  );
}
