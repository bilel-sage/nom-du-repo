"use client";

import { useState } from "react";
import {
  useBilearningStore,
  type ArticleInsert,
  type Article,
  type ArticleUpdate,
  type ArticleType,
} from "@/stores/use-bilearning-store";
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
import { Plus, Loader2, BookOpen, Video } from "lucide-react";

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
  article?: Article;
  trigger?: React.ReactNode;
  defaultType?: ArticleType;
}

export function ArticleDialog({ article, trigger, defaultType = "article" }: ArticleDialogProps) {
  const { addArticle, updateArticle } = useBilearningStore();
  const isEdit = Boolean(article);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [type, setType] = useState<ArticleType>(article?.type ?? defaultType);

  const reset = () => {
    if (!isEdit) {
      setTitle("");
      setContent("");
      setCategory("");
      setType(defaultType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    if (isEdit && article) {
      const updates: ArticleUpdate = { title: title.trim(), content, category, type };
      await updateArticle(article.id, updates);
    } else {
      const payload: ArticleInsert = { title: title.trim(), content, category, type };
      await addArticle(payload);
    }

    setLoading(false);
    reset();
    setOpen(false);
  };

  const typeLabel = type === "script" ? "Script" : "Article";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            {defaultType === "script" ? "Nouveau script" : "Nouvel article"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>
            {isEdit ? `Modifier le ${typeLabel.toLowerCase()}` : `Nouveau ${typeLabel.toLowerCase()}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            {/* Type selector — only shown in add mode */}
            {!isEdit && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("article")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    type === "article"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Article
                </button>
                <button
                  type="button"
                  onClick={() => setType("script")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    type === "script"
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Script vidéo
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="art-title">Titre</Label>
              <Input
                id="art-title"
                placeholder={type === "script" ? "Titre du script..." : "Titre de l'article..."}
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
              <Label htmlFor="art-content">
                {type === "script" ? "Script (contenu à lire)" : "Contenu"}
              </Label>
              <Textarea
                id="art-content"
                placeholder={
                  type === "script"
                    ? "Colle ton script ici..."
                    : "Notes, résumé, idées clés..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  // Entrée = retour à la ligne uniquement, ne valide pas le formulaire
                  if (e.key === "Enter") e.stopPropagation();
                }}
                rows={10}
                className="resize-none font-mono text-sm overflow-y-auto"
                style={{ maxHeight: "260px" }}
              />
            </div>
          </div>

          {/* Sticky footer — toujours visible */}
          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border bg-background">
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
