"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

// Requires a `bilearning_articles` table in Supabase:
// CREATE TABLE bilearning_articles (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
//   title text NOT NULL,
//   content text NOT NULL DEFAULT '',
//   category text NOT NULL DEFAULT '',
//   created_at timestamptz DEFAULT now() NOT NULL,
//   updated_at timestamptz DEFAULT now() NOT NULL
// );
// ALTER TABLE bilearning_articles ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage their own articles" ON bilearning_articles
//   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export type ArticleInsert = Pick<Article, "title" | "content" | "category">;
export type ArticleUpdate = Partial<Pick<Article, "title" | "content" | "category">>;

interface BilearningState {
  articles: Article[];
  loading: boolean;
  error: string | null;

  fetchArticles: () => Promise<void>;
  addArticle: (article: ArticleInsert) => Promise<void>;
  updateArticle: (id: string, updates: ArticleUpdate) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

export const useBilearningStore = create<BilearningState>((set) => ({
  articles: [],
  loading: false,
  error: null,

  fetchArticles: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bilearning_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ articles: (data ?? []) as Article[], loading: false });
  },

  addArticle: async (article) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("bilearning_articles")
      .insert({
        user_id: user.id,
        title: article.title,
        content: article.content,
        category: article.category,
      } as any)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({ articles: [data as Article, ...s.articles] }));
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
}));
