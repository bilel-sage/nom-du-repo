"use client";

import { useEffect } from "react";
import { useTodoStore } from "@/stores/use-todo-store";
import { useModeStore } from "@/stores/use-mode-store";
import { TodoList } from "@/components/todo/todo-list";
import { CheckSquare, Loader2 } from "lucide-react";

export default function TodoPage() {
  const { loading, fetchTodos, todos } = useTodoStore();
  const { mode } = useModeStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, mode]);

  const pending = todos.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary" />
          To Do
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {pending > 0
            ? `${pending} tâche${pending > 1 ? "s" : ""} à faire`
            : "Toutes les tâches sont complétées."}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <TodoList />
        </div>
      )}
    </div>
  );
}
