"use client";

import { type Book } from "@/stores/use-books-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Brain, BookMarked } from "lucide-react";

interface BookActionChooserProps {
  book: Book;
  onClose: () => void;
  onRead: () => void;
  onApprofondir: () => void;
}

export function BookActionChooser({ book, onClose, onRead, onApprofondir }: BookActionChooserProps) {
  const hasEpub = !!book.epub_url;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-10 h-14 object-cover rounded-md border border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-14 rounded-md bg-muted flex items-center justify-center border border-border shrink-0">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight">{book.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.author}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 pt-2">
          {/* Lire */}
          <button
            onClick={hasEpub ? onRead : undefined}
            disabled={!hasEpub}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              hasEpub
                ? "border-border hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer"
                : "border-border/50 opacity-50 cursor-not-allowed bg-muted/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasEpub ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"
            }`}>
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Lire</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasEpub
                  ? "Ouvrir le lecteur ePub intégré"
                  : "Importe un fichier ePub pour lire"}
              </p>
            </div>
          </button>

          {/* Approfondir */}
          <button
            onClick={onApprofondir}
            className="flex items-center gap-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 p-4 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Approfondir</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Préceptes, résumé, concepts, questions, insights
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
