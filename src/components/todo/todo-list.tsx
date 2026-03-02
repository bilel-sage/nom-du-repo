"use client";

import { useState } from "react";
import { useTodoStore, type TodoCategory, type Todo } from "@/stores/use-todo-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCheck, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Single column (one category) ────────────────────────────────────────────

interface TodoColumnProps {
  category: TodoCategory;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: (category: TodoCategory) => void;
}

function TodoColumn({ category, todos, onToggle, onDelete, onClearCompleted }: TodoColumnProps) {
  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  const isPerso = category === "perso";
  const label = isPerso ? "Perso" : "Pro";
  const accent = isPerso ? "text-blue-500" : "text-orange-500";
  const badgeBg = isPerso ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600";
  const Icon = isPerso ? User : Briefcase;

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-2">
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", badgeBg)}>
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className="text-xs text-muted-foreground">
          {pending.length} à faire
        </span>
      </div>

      {/* Pending */}
      <div className="space-y-1 min-h-[40px]">
        {pending.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
            Aucune tâche {label.toLowerCase()}
          </p>
        )}
        {pending.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
          >
            <Checkbox
              checked={false}
              onCheckedChange={() => onToggle(todo.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
            />
            <span className="flex-1 text-sm">{todo.text}</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Complétées ({completed.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
              onClick={() => onClearCompleted(category)}
            >
              <CheckCheck className="w-3 h-3" />
              Effacer
            </Button>
          </div>
          <div className="space-y-1">
            {completed.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group opacity-50"
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => onToggle(todo.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                />
                <span className={cn("flex-1 text-sm line-through text-muted-foreground")}>
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={() => onDelete(todo.id)}
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

// ─── Main component ───────────────────────────────────────────────────────────

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodoStore();
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<TodoCategory>("perso");

  const persoTodos = todos.filter((t) => t.category === "perso");
  const proTodos = todos.filter((t) => t.category === "pro");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addTodo(input.trim(), category);
    setInput("");
  };

  return (
    <div className="space-y-5">
      {/* Input + category selector */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
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
        </div>

        {/* Category pills */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCategory("perso")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              category === "perso"
                ? "bg-blue-500/15 text-blue-600 border-blue-400/40"
                : "text-muted-foreground border-border hover:border-blue-300 hover:text-blue-500"
            )}
          >
            <User className="w-3 h-3" />
            Perso
          </button>
          <button
            type="button"
            onClick={() => setCategory("pro")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              category === "pro"
                ? "bg-orange-500/15 text-orange-600 border-orange-400/40"
                : "text-muted-foreground border-border hover:border-orange-300 hover:text-orange-500"
            )}
          >
            <Briefcase className="w-3 h-3" />
            Pro
          </button>
        </div>
      </form>

      {/* Two columns */}
      <div className="flex flex-col sm:flex-row gap-6">
        <TodoColumn
          category="perso"
          todos={persoTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
        />
        <div className="hidden sm:block w-px bg-border shrink-0" />
        <TodoColumn
          category="pro"
          todos={proTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
        />
      </div>
    </div>
  );
}
