"use client";

import { useState } from "react";
import { useRecurrentesStore, type RecurringTask } from "@/stores/use-recurrentes-store";
import { RecurringTaskDialog } from "@/components/recurrentes/recurring-task-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RotateCcw, Edit3, Trash2, Check, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

function TaskCard({ task }: { task: RecurringTask }) {
  const { toggleToday, isCompletedToday, deleteTask } = useRecurrentesStore();
  const [showEdit, setShowEdit] = useState(false);
  const done = isCompletedToday(task.id);

  return (
    <>
      <div className={cn(
        "group rounded-2xl border bg-card p-4 transition-all",
        done ? "border-primary/30 bg-primary/5" : "border-border hover:border-foreground/20"
      )}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => toggleToday(task.id)}
            className={cn(
              "w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
              done
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border hover:border-primary"
            )}
          >
            {done && <Check className="w-3.5 h-3.5" />}
          </button>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-sm leading-tight",
              done && "line-through text-muted-foreground"
            )}>
              {task.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatDuration(task.duration)}</span>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {task.frequency === "daily" ? "Quotidien" : "Hebdo"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <RecurringTaskDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          task={task}
        />
      )}
    </>
  );
}

export default function RecurrentesPage() {
  const { tasks } = useRecurrentesStore();
  const [showAdd, setShowAdd] = useState(false);

  const dailyTasks = tasks.filter((t) => t.frequency === "daily");
  const weeklyTasks = tasks.filter((t) => t.frequency === "weekly");

  const doneToday = tasks.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.completedDates.includes(today);
  }).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            Récurrentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Tâches disciplinées à effectuer régulièrement.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>
              <span className="font-semibold text-foreground">{doneToday}</span> / {tasks.length} faites aujourd'hui
            </span>
          </div>
        </div>
      )}

      {/* Empty */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold">Aucune tâche récurrente</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoute des tâches que tu dois faire chaque jour ou chaque semaine.
          </p>
          <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
            <p>Exemples : 1h veille informatique, Lecture 30min</p>
            <p>Écriture script, Création article</p>
          </div>
          <Button className="mt-5" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une tâche
          </Button>
        </div>
      )}

      {/* Quotidien */}
      {dailyTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Quotidien ({dailyTasks.length})
            </span>
          </div>
          {dailyTasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {/* Hebdo */}
      {weeklyTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Hebdomadaire ({weeklyTasks.length})
            </span>
          </div>
          {weeklyTasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {showAdd && (
        <RecurringTaskDialog open={showAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
