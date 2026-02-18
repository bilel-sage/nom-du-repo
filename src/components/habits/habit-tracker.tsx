"use client";

import { useState } from "react";
import { useHabitStore, getLast7Days, getToday, FIXED_CATEGORIES } from "@/stores/use-habit-store";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Trash2, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function getDayLabel(dateStr: string): string {
  return DAY_LABELS[new Date(dateStr + "T12:00:00").getDay()];
}

function getDayNumber(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").getDate().toString();
}

// ─── Inline edit for habit name ───────────────────────────────────────────────
function InlineEdit({ id, name }: { id: string; name: string }) {
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  const save = () => {
    if (value.trim() && value.trim() !== name) updateHabit(id, { name: value.trim() });
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="h-6 text-sm px-1 py-0 w-full max-w-[160px]"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 group/edit text-left"
      title="Cliquer pour modifier"
    >
      <span className="text-sm font-medium truncate">{name}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover/edit:opacity-60 transition-opacity shrink-0 text-muted-foreground" />
    </button>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({
  category,
  days,
  today,
}: {
  category: (typeof FIXED_CATEGORIES)[number];
  days: string[];
  today: string;
}) {
  const { getHabitsByCategory, toggleDay, isChecked, getStreakForHabit, deleteHabit } =
    useHabitStore();

  const habits = getHabitsByCategory(category.id);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Category header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
          <span className="text-sm font-semibold tracking-tight">{category.label}</span>
          {habits.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {habits.length}
            </span>
          )}
        </div>
        <HabitDialog defaultCategory={category.id} />
      </div>

      {habits.length === 0 ? (
        <div className="px-4 py-5 text-center text-xs text-muted-foreground">
          Aucune habitude — cliquez sur Ajouter pour en créer une.
        </div>
      ) : (
        <>
          {/* Day header row */}
          <div
            className="grid items-center border-b border-border bg-muted/10"
            style={{ gridTemplateColumns: "1fr repeat(7, 44px) 72px" }}
          >
            <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Habitude
            </div>
            {days.map((d) => (
              <div
                key={d}
                className={cn("text-center py-2", d === today && "bg-primary/5")}
              >
                <div className="text-[9px] text-muted-foreground uppercase">{getDayLabel(d)}</div>
                <div className={cn(
                  "text-[11px] font-semibold mt-0.5",
                  d === today
                    ? "text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center mx-auto"
                    : "text-muted-foreground"
                )}>
                  {getDayNumber(d)}
                </div>
              </div>
            ))}
            <div className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Streak
            </div>
          </div>

          {/* Habit rows */}
          {habits.map((habit) => {
            const streak = getStreakForHabit(habit.id);
            return (
              <div
                key={habit.id}
                className="group grid items-center border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors"
                style={{ gridTemplateColumns: "1fr repeat(7, 44px) 72px" }}
              >
                {/* Habit name */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <InlineEdit id={habit.id} name={habit.name} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
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
                      className={cn("flex items-center justify-center py-2.5", d === today && "bg-primary/5")}
                    >
                      <button
                        onClick={() => toggleDay(habit.id, d)}
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                          checked
                            ? "text-white"
                            : "border border-border hover:border-foreground/40 hover:scale-105"
                        )}
                        style={checked ? { backgroundColor: habit.color } : undefined}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}

                {/* Streak */}
                <div className="flex items-center justify-center py-2.5">
                  {streak > 0 ? (
                    <span className={cn("flex items-center gap-0.5 text-xs font-bold", streak >= 7 ? "text-amber-500" : "text-muted-foreground")}>
                      <Flame className={cn("w-3.5 h-3.5", streak >= 7 ? "text-amber-500" : "text-muted-foreground")} />
                      {streak}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Main tracker ─────────────────────────────────────────────────────────────
export function HabitTracker() {
  const days = getLast7Days();
  const today = getToday();

  return (
    <div className="space-y-4">
      {FIXED_CATEGORIES.map((cat) => (
        <CategorySection key={cat.id} category={cat} days={days} today={today} />
      ))}
    </div>
  );
}
