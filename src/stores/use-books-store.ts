"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Principle {
  id: string;
  content: string;
}

export interface Annotation {
  id: string;
  text: string;
  note?: string;
  category: "idee" | "citation" | "action" | "question";
  chapterIndex: number;
  cfiRange?: string;
  color: string;
  createdAt: string;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
}

export interface Question {
  id: string;
  content: string;
  answer?: string;
}

export interface Insight {
  id: string;
  content: string;
}

export interface ReadingProgress {
  percentage: number;
  chapterIndex: number;
  cfi?: string;
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
  // Nouveaux champs optionnels
  epub_url?: string;
  description?: string;
  reading_progress?: ReadingProgress;
  annotations?: Annotation[];
  summary?: string;
  concepts?: Concept[];
  questions?: Question[];
  insights?: Insight[];
}

export type BookInsert = {
  title: string;
  author: string;
  cover_url?: string;
  deadline?: string | null;
  epub_url?: string;
  description?: string;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface BooksState {
  books: Book[];
  loading: boolean;
  error: string | null;

  fetchBooks: () => Promise<void>;
  addBook: (book: BookInsert) => Promise<Book | null>;
  updateBook: (id: string, updates: Partial<Pick<Book, "title" | "author" | "cover_url" | "deadline" | "status" | "applied">>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  addPrinciple: (bookId: string, content: string) => Promise<void>;
  updatePrinciple: (bookId: string, principleId: string, content: string) => Promise<void>;
  removePrinciple: (bookId: string, principleId: string) => Promise<void>;

  setApplied: (bookId: string, applied: boolean) => Promise<void>;
  setStatus: (bookId: string, status: "en_cours" | "termine") => Promise<void>;

  getDaysLeft: (book: Book) => number | null;
  getDeadlineProgress: (book: Book) => number;

  // ePub
  uploadEpub: (bookId: string, file: File) => Promise<string | null>;

  // Lecture
  saveReadingProgress: (bookId: string, progress: ReadingProgress) => Promise<void>;

  // Annotations
  addAnnotation: (bookId: string, ann: Omit<Annotation, "id" | "createdAt">) => Promise<boolean>;
  removeAnnotation: (bookId: string, annId: string) => Promise<void>;
  updateAnnotation: (bookId: string, annId: string, note: string) => Promise<void>;

  // Approfondir
  updateSummary: (bookId: string, summary: string) => Promise<void>;
  addConcept: (bookId: string, c: Omit<Concept, "id">) => Promise<void>;
  updateConcept: (bookId: string, id: string, updates: Partial<Concept>) => Promise<void>;
  removeConcept: (bookId: string, id: string) => Promise<void>;
  addQuestion: (bookId: string, q: Omit<Question, "id">) => Promise<void>;
  updateQuestion: (bookId: string, id: string, updates: Partial<Question>) => Promise<void>;
  removeQuestion: (bookId: string, id: string) => Promise<void>;
  addInsight: (bookId: string, i: Omit<Insight, "id">) => Promise<void>;
  updateInsight: (bookId: string, id: string, content: string) => Promise<void>;
  removeInsight: (bookId: string, id: string) => Promise<void>;
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
    if (!user) return null;

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
        epub_url: book.epub_url ?? "",
        description: book.description ?? "",
      } as any)
      .select()
      .single();

    if (error) { set({ error: error.message }); return null; }
    set((s) => ({ books: [data as Book, ...s.books] }));
    return data as Book;
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

  uploadEpub: async (bookId, file) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Stocke le chemin (path), pas l'URL publique — le bucket est privé
    const epub_url = `${user.id}/${bookId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("epub-books")
      .upload(epub_url, file, { upsert: true });

    if (uploadError) { set({ error: uploadError.message }); return null; }

    const { error } = await supabase.from("books").update({ epub_url } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return null; }

    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, epub_url } : b)) }));
    return epub_url;
  },

  saveReadingProgress: async (bookId, progress) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("books")
      .update({ reading_progress: progress } as any)
      .eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({
      books: s.books.map((b) => (b.id === bookId ? { ...b, reading_progress: progress } : b)),
    }));
  },

  addAnnotation: async (bookId, ann) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return false;
    const newAnn: Annotation = {
      ...ann,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const annotations = [...(book.annotations ?? []), newAnn];
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ annotations } as any).eq("id", bookId);
    if (error) {
      set({ error: error.message });
      console.error("[addAnnotation] Supabase error:", error.message);
      return false;
    }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, annotations } : b)) }));
    return true;
  },

  removeAnnotation: async (bookId, annId) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const annotations = (book.annotations ?? []).filter((a) => a.id !== annId);
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ annotations } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, annotations } : b)) }));
  },

  updateAnnotation: async (bookId, annId, note) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const annotations = (book.annotations ?? []).map((a) =>
      a.id === annId ? { ...a, note } : a
    );
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ annotations } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, annotations } : b)) }));
  },

  updateSummary: async (bookId, summary) => {
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ summary } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, summary } : b)) }));
  },

  addConcept: async (bookId, c) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const concepts = [...(book.concepts ?? []), { ...c, id: generateId() }];
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ concepts } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, concepts } : b)) }));
  },

  updateConcept: async (bookId, id, updates) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const concepts = (book.concepts ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c));
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ concepts } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, concepts } : b)) }));
  },

  removeConcept: async (bookId, id) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const concepts = (book.concepts ?? []).filter((c) => c.id !== id);
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ concepts } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, concepts } : b)) }));
  },

  addQuestion: async (bookId, q) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const questions = [...(book.questions ?? []), { ...q, id: generateId() }];
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ questions } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, questions } : b)) }));
  },

  updateQuestion: async (bookId, id, updates) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const questions = (book.questions ?? []).map((q) => (q.id === id ? { ...q, ...updates } : q));
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ questions } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, questions } : b)) }));
  },

  removeQuestion: async (bookId, id) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const questions = (book.questions ?? []).filter((q) => q.id !== id);
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ questions } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, questions } : b)) }));
  },

  addInsight: async (bookId, i) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const insights = [...(book.insights ?? []), { ...i, id: generateId() }];
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ insights } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, insights } : b)) }));
  },

  updateInsight: async (bookId, id, content) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const insights = (book.insights ?? []).map((i) => (i.id === id ? { ...i, content } : i));
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ insights } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, insights } : b)) }));
  },

  removeInsight: async (bookId, id) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const insights = (book.insights ?? []).filter((i) => i.id !== id);
    const supabase = createClient();
    const { error } = await supabase.from("books").update({ insights } as any).eq("id", bookId);
    if (error) { set({ error: error.message }); return; }
    set((s) => ({ books: s.books.map((b) => (b.id === bookId ? { ...b, insights } : b)) }));
  },
}));
