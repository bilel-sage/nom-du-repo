"use client";

import { useState } from "react";
import { useBooksStore, type Book } from "@/stores/use-books-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookDialogProps {
  open: boolean;
  onClose: () => void;
  book?: Book;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function BookDialog({ open, onClose, book }: BookDialogProps) {
  const { addBook, updateBook } = useBooksStore();

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? "");
  const [deadline, setDeadline] = useState(
    book?.deadline ? book.deadline.split("T")[0] : addDays(30)
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setLoading(true);
    if (book) {
      await updateBook(book.id, {
        title: title.trim(),
        author: author.trim(),
        cover_url: coverUrl.trim(),
        deadline: deadline || null,
      });
    } else {
      await addBook({
        title: title.trim(),
        author: author.trim(),
        cover_url: coverUrl.trim(),
        deadline: deadline || null,
      });
    }
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? "Modifier le livre" : "Ajouter un livre"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Atomic Habits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              placeholder="Ex: James Clear"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cover">URL de la couverture</Label>
            <Input
              id="cover"
              type="url"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Colle l'URL d'une image trouvée sur Google Images ou autre.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <div className="flex gap-2">
              {[15, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeadline(addDays(d))}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  {d}j
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : book ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
