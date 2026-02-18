"use client";

import { useState } from "react";
import { useBilearningStore, type ArticleInsert, type Article, type ArticleUpdate } from "@/stores/use-bilearning-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Pencil } from "lucide-react";

const CATEGORIES = [
  "Programmation",
  "Design",
  "Business",
  "Productivité",
  "Sciences",
  "Langues",
  "Autre",
];

interface ArticleDialogProps {
  article?: Article; // if provided → edit mode
  trigger?: React.ReactNode;
}

export function ArticleDialog({ article, trigger }: ArticleDialogProps) {
  const { addArticle, updateArticle } = useBilearningStore();
  const isEdit = Boolean(article);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState(article?.category ?? "");

  const reset = () => {
    if (!isEdit) {
      setTitle("");
      setContent("");
      setCategory("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    if (isEdit && article) {
      const updates: ArticleUpdate = { title: title.trim(), content, category };
      await updateArticle(article.id, updates);
    } else {
      const payload: ArticleInsert = { title: title.trim(), content, category };
      await addArticle(payload);
    }

    setLoading(false);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="art-title">Titre</Label>
            <Input
              id="art-title"
              placeholder="Titre de l'article..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="art-category">Catégorie</Label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat === category ? "" : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Input
              id="art-category"
              placeholder="Ou saisir une catégorie personnalisée..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="art-content">Contenu</Label>
            <Textarea
              id="art-content"
              placeholder="Notes, résumé, idées clés..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-y font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEdit ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
