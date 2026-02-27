"use client";

import { useEffect, useState } from "react";
import { useBooksStore, type Book } from "@/stores/use-books-store";
import { BookCard } from "@/components/livres/book-card";
import { BookDialog } from "@/components/livres/book-dialog";
import { BookDetailModal } from "@/components/livres/book-detail-modal";
import { BookActionChooser } from "@/components/livres/book-action-chooser";
import { BookReader } from "@/components/livres/book-reader";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Loader2 } from "lucide-react";

export default function LivresPage() {
  const { books, loading, error, fetchBooks } = useBooksStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [actionBook, setActionBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [approfondirBook, setApprofondirBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<"all" | "en_cours" | "termine">("all");

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Sync open modals with store updates
  useEffect(() => {
    if (actionBook) {
      const updated = books.find((b) => b.id === actionBook.id);
      if (updated) setActionBook(updated);
    }
    if (approfondirBook) {
      const updated = books.find((b) => b.id === approfondirBook.id);
      if (updated) setApprofondirBook(updated);
    }
    if (readingBook) {
      const updated = books.find((b) => b.id === readingBook.id);
      if (updated) setReadingBook(updated);
    }
  }, [books]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === "all" ? books : books.filter((b) => b.status === filter);
  const enCours = books.filter((b) => b.status === "en_cours").length;
  const termines = books.filter((b) => b.status === "termine").length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Livres
          </h1>
          <p className="text-muted-foreground mt-1">
            Tes lectures, tes préceptes, ton application.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Stats */}
      {books.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous ({books.length})
          </button>
          <button
            onClick={() => setFilter("en_cours")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === "en_cours" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            En cours ({enCours})
          </button>
          <button
            onClick={() => setFilter("termine")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === "termine" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Terminés ({termines})
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 text-sm text-red-600 dark:text-red-400">
          <p className="font-medium">Erreur de chargement</p>
          <p className="mt-1 text-xs">{error}</p>
          <p className="mt-2 text-xs opacity-75">
            Assure-toi que la table <code>books</code> existe dans Supabase. Voir le SQL requis dans la documentation.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold">
            {filter === "all" ? "Aucun livre ajouté" : "Aucun livre dans cette catégorie"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "all" && "Ajoute ton premier livre à lire."}
          </p>
          {filter === "all" && (
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un livre
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAction={(b) => setActionBook(b)}
              onEdit={(b) => setEditBook(b)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showAdd && (
        <BookDialog open={showAdd} onClose={() => setShowAdd(false)} />
      )}
      {editBook && (
        <BookDialog open={!!editBook} onClose={() => setEditBook(null)} book={editBook} />
      )}
      {actionBook && !readingBook && !approfondirBook && (
        <BookActionChooser
          book={actionBook}
          onClose={() => setActionBook(null)}
          onRead={() => {
            setReadingBook(actionBook);
            setActionBook(null);
          }}
          onApprofondir={() => {
            setApprofondirBook(actionBook);
            setActionBook(null);
          }}
        />
      )}
      {approfondirBook && (
        <BookDetailModal book={approfondirBook} onClose={() => setApprofondirBook(null)} />
      )}
      {readingBook && (
        <BookReader book={readingBook} onClose={() => setReadingBook(null)} />
      )}
    </div>
  );
}
