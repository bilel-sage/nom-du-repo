"use client";

import { useEffect } from "react";
import { useDoItNowStore } from "@/stores/use-doitnow-store";
import { TaskDialog } from "@/components/do-it-now/task-dialog";
import { TaskCard } from "@/components/do-it-now/task-card";
import { Timer, Loader2, Inbox } from "lucide-react";

export default function DoItNowPage() {
  const { tasks, sessions, loading, activeTimer, fetchTasks, fetchSessions } = useDoItNowStore();

  useEffect(() => {
    fetchTasks().then(() => fetchSessions(30));
  }, [fetchTasks, fetchSessions]);

  const activeTask = activeTimer
    ? tasks.find((t) => t.id === activeTimer.taskId)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Do It Now
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Crée une tâche, lance le chrono, reste focus.
          </p>
        </div>
        <TaskDialog />
      </div>

      {/* Active session banner */}
      {activeTask && activeTimer && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">
            Session en cours : <strong>{activeTask.name}</strong>
          </span>
          <span className="ml-auto text-lg font-mono font-bold tabular-nums text-primary">
            {Math.floor(activeTimer.elapsed / 60).toString().padStart(2, "0")}:
            {(activeTimer.elapsed % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune tâche. Ajoutez votre première tâche pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} sessions={sessions} />
          ))}
        </div>
      )}
    </div>
  );
}
