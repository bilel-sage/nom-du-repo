"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export type TodoCategory = "perso" | "pro";

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  mode: string;
  category: TodoCategory;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  addTodo: (text: string, category: TodoCategory) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clearCompleted: (category?: TodoCategory) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    // Normalize category for rows that pre-date the column
    const todos = (data ?? []).map((t: any) => ({
      ...t,
      category: (t.category as TodoCategory) ?? "perso",
    })) as Todo[];
    set({ todos, loading: false });
  },

  addTodo: async (text, category) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: user.id, text: text.trim(), completed: false, mode, category } as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    const todo = { ...(data as any), category: (data as any).category ?? "perso" } as Todo;
    set((s) => ({ todos: [...s.todos, todo] }));
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed } as any)
      .eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  },

  deleteTodo: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
  },

  clearCompleted: async (category) => {
    const todos = get().todos;
    const completedIds = todos
      .filter((t) => t.completed && (category === undefined || t.category === category))
      .map((t) => t.id);
    if (completedIds.length === 0) return;

    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().in("id", completedIds);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ todos: s.todos.filter((t) => !completedIds.includes(t.id)) }));
  },
}));
