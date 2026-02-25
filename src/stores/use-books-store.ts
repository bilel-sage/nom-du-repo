"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Principle {
  id: string;
  content: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string;
  created_at: string;
  deadline: string | null;
  status: "en_cours" | "termine";
  principles: Principle[];
  applied: boolean;
}

export type BookInsert = {
  title: string;
  author: string;
  cover_url?: string;
  deadline?: string | null;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface BooksState {
  books: Book[];
  loading: boolean;
  error: string | null;

  fetchBooks: () => Promise<void>;
  addBook: (book: BookInsert) => Promise<void>;
  updateBook: (id: string, updates: Partial<Pick<Book, "title" | "author" | "cover_url" | "deadline" | "status" | "applied">>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  addPrinciple: (bookId: string, content: string) => Promise<void>;
  updatePrinciple: (bookId: string, principleId: string, content: string) => Promise<void>;
  removePrinciple: (bookId: string, principleId: string) => Promise<void>;

  setApplied: (bookId: string, applied: boolean) => Promise<void>;
  setStatus: (bookId: string, status: "en_cours" | "termine") => Promise<void>;

  getDaysLeft: (book: Book) => number | null;
  getDeadlineProgress: (book: Book) => number;
}

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  loading: false,
  error: null,

  fetchBooks: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { set({ error: error.message, loading: false }); return; }
    set({ books: (data ?? []) as Book[], loading: false });
  },

  addBook: async (book) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("books")
      .insert({
        user_id: user.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url ?? "",
        deadline: book.deadline ?? null,
        status: "en_cours",
        principles: [],
        applied: false,
      } as any)
      .select()
      .single();

    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: [data as Book, ...s.books] }));
  },

  updateBook: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase.from("books").update(updates as any).eq("id", id);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
  },

  deleteBook: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
  },

  addPrinciple: async (bookId, content) => {
    if (!content.trim()) return;
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const principles = [...book.principles, { id: generateId(), content: content.trim() }];
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ principles } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, principles } : b)) }));
  },

  updatePrinciple: async (bookId, principleId, content) => {
    if (!content.trim()) return;
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const principles = book.principles.map((p) =>
      p.id === principleId ? { ...p, content: content.trim() } : p
    );
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ principles } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, principles } : b)) }));
  },

  removePrinciple: async (bookId, principleId) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const principles = book.principles.filter((p) => p.id !== principleId);
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ principles } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, principles } : b)) }));
  },

  setApplied: async (bookId, applied) => {
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ applied } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, applied } : b)) }));
  },

  setStatus: async (bookId, status) => {
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ status } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, status } : b)) }));
  },

  getDaysLeft: (book) => {
    if (!book.deadline) return null;
    const diff = Math.ceil(
      (new Date(book.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  },

  getDeadlineProgress: (book) => {
    if (!book.deadline) return 0;
    const created = new Date(book.created_at).getTime();
    const deadline = new Date(book.deadline).getTime();
    const now = Date.now();
    const total = deadline - created;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((now - created) / total) * 100));
  },
}));
