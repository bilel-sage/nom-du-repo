"use client";

import { useState } from "react";
import { useTodoStore } from "@/stores/use-todo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodoStore();
  const [input, setInput] = useState("");

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addTodo(input.trim());
    setInput("");
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Ajouter une tâche..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!input.trim()} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </form>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="space-y-1">
          {pending.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
            >
              <Checkbox
                checked={false}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
              />
              <span className="flex-1 text-sm">{todo.text}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucune tâche. Commencez par en ajouter une.
        </p>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Complétées ({completed.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={clearCompleted}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Effacer
            </Button>
          </div>
          <div className="space-y-1">
            {completed.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group opacity-60"
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                />
                <span className={cn("flex-1 text-sm line-through text-muted-foreground")}>
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
