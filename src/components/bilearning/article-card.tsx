"use client";

import { useState } from "react";
import { type Article, useBilearningStore } from "@/stores/use-bilearning-store";
import { ArticleDialog } from "./article-dialog";
import { ScriptFocusModal } from "./script-focus-modal";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  Circle,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { deleteArticle, toggleRead } = useBilearningStore();
  const [expanded, setExpanded] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  const isScript = article.type === "script";
  const preview = article.content.slice(0, 160);
  const hasMore = article.content.length > 160;

  const formattedDate = new Date(article.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md",
          article.is_read ? "border-emerald-500/40 bg-emerald-500/5" : "border-border",
          isScript && !article.is_read && "border-violet-500/30"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isScript && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500 uppercase tracking-wide">
                  Script
                </span>
              )}
              {article.is_read && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 uppercase tracking-wide">
                  {isScript ? "Terminé" : "Lu"}
                </span>
              )}
            </div>
            <h3 className={cn("font-semibold text-sm leading-snug", article.is_read && "text-muted-foreground line-through")}>
              {article.title}
            </h3>
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
            {/* Script focus mode button */}
            {isScript && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10"
                title="Mode Focus"
                onClick={() => setFocusOpen(true)}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            )}

            {/* Toggle read/done */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-7 h-7",
                article.is_read
                  ? "text-emerald-500 hover:text-emerald-600"
                  : "text-muted-foreground hover:text-emerald-500"
              )}
              title={article.is_read ? (isScript ? "Marquer non terminé" : "Marquer non lu") : (isScript ? "Marquer terminé" : "Marquer lu")}
              onClick={() => toggleRead(article.id)}
            >
              {article.is_read ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
            </Button>

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

        {/* Script CTA */}
        {isScript && !article.is_read && (
          <button
            onClick={() => setFocusOpen(true)}
            className="w-full mt-1 py-2 rounded-lg bg-violet-500/10 text-violet-600 text-xs font-semibold hover:bg-violet-500/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Ouvrir en mode focus
          </button>
        )}
      </div>

      {/* Script focus overlay */}
      {focusOpen && (
        <ScriptFocusModal script={article} onClose={() => setFocusOpen(false)} />
      )}
    </>
  );
}
