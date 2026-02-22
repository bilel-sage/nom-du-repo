"use client";

import { useEffect, useState } from "react";
import { useBilearningStore } from "@/stores/use-bilearning-store";
import { ArticleDialog } from "@/components/bilearning/article-dialog";
import { ArticleCard } from "@/components/bilearning/article-card";
import {
  BookOpenText,
  Loader2,
  Inbox,
  Search,
  Video,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "articles" | "scripts";

export default function BilearningPage() {
  const { articles, loading, fetchArticles } = useBilearningStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("articles");

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const tabItems = articles.filter((a) => a.type === tab);
  const readCount = tabItems.filter((a) => a.is_read).length;

  const categories = Array.from(
    new Set(tabItems.map((a) => a.category).filter(Boolean))
  );

  const filtered = tabItems.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const articlesCount = articles.filter((a) => a.type === "articles").length;
  const scriptsCount = articles.filter((a) => a.type === "script").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpenText className="w-6 h-6 text-primary" />
            Bilearning
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vos notes d'apprentissage structurées.
          </p>
        </div>
        <ArticleDialog defaultType={tab === "scripts" ? "script" : "article"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("articles"); setActiveCategory(null); }}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border",
            tab === "articles"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Articles
          <span className={cn(
            "ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold",
            tab === "articles" ? "bg-white/20" : "bg-muted"
          )}>
            {articles.filter((a) => a.type === "article").length}
          </span>
        </button>
        <button
          onClick={() => { setTab("scripts"); setActiveCategory(null); }}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border",
            tab === "scripts"
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Video className="w-4 h-4" />
          Scripts
          <span className={cn(
            "ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold",
            tab === "scripts" ? "bg-white/20" : "bg-muted"
          )}>
            {articles.filter((a) => a.type === "script").length}
          </span>
        </button>
      </div>

      {/* Stats bar */}
      {tabItems.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{readCount}</span>
            {" / "}
            <span className="font-semibold text-foreground">{tabItems.length}</span>
            {" "}
            {tab === "scripts" ? "scripts terminés" : "articles lus"}
          </span>
          {readCount > 0 && tabItems.length > 0 && (
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  tab === "scripts" ? "bg-violet-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.round((readCount / tabItems.length) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {tabItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="h-8 text-xs"
              >
                Tous
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className="h-8 text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tabItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            {tab === "scripts" ? (
              <Video className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Inbox className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {tab === "scripts"
              ? "Aucun script. Créez votre premier script Bilearning."
              : "Aucun article. Créez votre premier article Bilearning."}
          </p>
          <ArticleDialog defaultType={tab === "scripts" ? "script" : "article"} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun résultat ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
