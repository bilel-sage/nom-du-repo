"use client";

import { useBooksStore, type Book } from "@/stores/use-books-store";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trash2, Edit3, CheckCircle, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  onAction: (book: Book) => void;
  onEdit: (book: Book) => void;
}

export function BookCard({ book, onAction, onEdit }: BookCardProps) {
  const { getDaysLeft, getDeadlineProgress, deleteBook } = useBooksStore();
  const daysLeft = getDaysLeft(book);
  const progress = getDeadlineProgress(book);
  const readingPct = book.reading_progress?.percentage ?? 0;

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Supprimer "${book.title}" ?`)) deleteBook(book.id);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(book);
  }

  return (
    <div
      className="group rounded-2xl border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all"
      onClick={() => onAction(book)}
    >
      <div className="flex gap-3">
        {/* Couverture */}
        <div className="shrink-0">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-14 h-20 object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="w-14 h-20 rounded-lg bg-muted flex items-center justify-center border border-border">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{book.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
            </div>
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={book.status === "termine" ? "default" : "secondary"} className="text-[10px]">
              {book.status === "termine" ? "Terminé" : "En cours"}
            </Badge>
            {book.epub_url && (
              <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-400/50 gap-1">
                <BookMarked className="w-2.5 h-2.5" />
                ePub
              </Badge>
            )}
            {book.applied && (
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px] font-medium">Appliqué</span>
              </div>
            )}
            {book.principles.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {book.principles.length} précepte{book.principles.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Progression lecture */}
          {readingPct > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Lecture</span>
                <span className="text-[10px] font-medium text-blue-600">{Math.round(readingPct)}%</span>
              </div>
              <Progress value={readingPct} className="h-1 [&>div]:bg-blue-500" />
            </div>
          )}

          {/* Deadline */}
          {book.deadline && (
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">
                    {daysLeft === null ? "—"
                      : daysLeft < 0 ? `${Math.abs(daysLeft)}j de retard`
                      : daysLeft === 0 ? "Aujourd'hui !"
                      : `${daysLeft}j restant${daysLeft > 1 ? "s" : ""}`}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  daysLeft !== null && daysLeft < 0 ? "text-red-500"
                  : daysLeft !== null && daysLeft <= 7 ? "text-amber-500"
                  : "text-muted-foreground"
                )}>
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress
                value={progress}
                className={cn(
                  "h-1",
                  daysLeft !== null && daysLeft < 0 ? "[&>div]:bg-red-500"
                  : daysLeft !== null && daysLeft <= 7 ? "[&>div]:bg-amber-500"
                  : ""
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
