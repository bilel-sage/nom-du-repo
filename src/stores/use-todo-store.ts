"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  mode: string;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
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
    set({ todos: (data ?? []) as Todo[], loading: false });
  },

  addTodo: async (text) => {
    if (!text.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: user.id, text: text.trim(), completed: false, mode } as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ todos: [...s.todos, data as Todo] }));
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

  clearCompleted: async () => {
    const completedIds = get().todos.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) return;

    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().in("id", completedIds);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ todos: s.todos.filter((t) => !t.completed) }));
  },
}));
