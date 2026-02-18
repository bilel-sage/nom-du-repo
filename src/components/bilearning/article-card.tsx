"use client";

import { useState } from "react";
import { type Article, useBilearningStore } from "@/stores/use-bilearning-store";
import { ArticleDialog } from "./article-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { deleteArticle } = useBilearningStore();
  const [expanded, setExpanded] = useState(false);

  const preview = article.content.slice(0, 160);
  const hasMore = article.content.length > 160;

  const formattedDate = new Date(article.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm leading-snug">{article.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {article.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Tag className="w-2.5 h-2.5" />
                {article.category}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ArticleDialog
            article={article}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive"
            onClick={() => deleteArticle(article.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {article.content && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {expanded ? article.content : preview}
          {!expanded && hasMore && "…"}
        </div>
      )}

      {/* Toggle expand */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Lire la suite
            </>
          )}
        </button>
      )}
    </div>
  );
}
