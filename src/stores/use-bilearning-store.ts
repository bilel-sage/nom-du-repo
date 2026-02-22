"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useModeStore } from "@/stores/use-mode-store";

// Table bilearning_articles (add columns if needed):
// ALTER TABLE bilearning_articles ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;
// ALTER TABLE bilearning_articles ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'article';
// ALTER TABLE bilearning_articles ADD COLUMN IF NOT EXISTS mode text DEFAULT 'learning';

export type ArticleType = "article" | "script";

export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_read: boolean;
  type: ArticleType;
  created_at: string;
  updated_at: string;
  mode: string;
}

export type ArticleInsert = Pick<Article, "title" | "content" | "category" | "type">;
export type ArticleUpdate = Partial<Pick<Article, "title" | "content" | "category" | "is_read" | "type">>;

interface BilearningState {
  articles: Article[];
  loading: boolean;
  error: string | null;

  fetchArticles: () => Promise<void>;
  addArticle: (article: ArticleInsert) => Promise<void>;
  updateArticle: (id: string, updates: ArticleUpdate) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  toggleRead: (id: string) => Promise<void>;
}

export const useBilearningStore = create<BilearningState>((set, get) => ({
  articles: [],
  loading: false,
  error: null,

  fetchArticles: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("bilearning_articles")
      .select("*")
      .eq("mode", mode)
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    // Normalize missing fields gracefully
    const normalized = ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      ...row,
      is_read: row.is_read ?? false,
      type: (row.type as ArticleType) ?? "article",
      mode: (row.mode as string) ?? "learning",
    })) as Article[];
    set({ articles: normalized, loading: false });
  },

  addArticle: async (article) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const mode = useModeStore.getState().mode;
    const { data, error } = await supabase
      .from("bilearning_articles")
      .insert({
        user_id: user.id,
        title: article.title,
        content: article.content,
        category: article.category,
        type: article.type,
        is_read: false,
        mode,
      } as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    const row = data as Record<string, unknown>;
    const normalized: Article = {
      ...(row as any),
      is_read: row.is_read ?? false,
      type: (row.type as ArticleType) ?? "article",
      mode: (row.mode as string) ?? "learning",
    };
    set((s) => ({ articles: [normalized, ...s.articles] }));
  },

  updateArticle: async (id, updates) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bilearning_articles")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", id);

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      articles: s.articles.map((a) =>
        a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
      ),
    }));
  },

  deleteArticle: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("bilearning_articles").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ articles: s.articles.filter((a) => a.id !== id) }));
  },

  toggleRead: async (id) => {
    const article = get().articles.find((a) => a.id === id);
    if (!article) return;
    const newVal = !article.is_read;
    const supabase = createClient();
    const { error } = await supabase
      .from("bilearning_articles")
      .update({ is_read: newVal } as any)
      .eq("id", id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      articles: s.articles.map((a) =>
        a.id === id ? { ...a, is_read: newVal } : a
      ),
    }));
  },
}));
