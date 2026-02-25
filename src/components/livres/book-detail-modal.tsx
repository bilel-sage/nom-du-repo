"use client";

import { useState } from "react";
import { useBooksStore, type Book } from "@/stores/use-books-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Trash2, Edit3, Check, X, BookOpen, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const {
    addPrinciple, updatePrinciple, removePrinciple,
    setApplied, setStatus, getDaysLeft, getDeadlineProgress,
  } = useBooksStore();

  const [newPrinciple, setNewPrinciple] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const daysLeft = getDaysLeft(book);
  const progress = getDeadlineProgress(book);

  async function handleAddPrinciple() {
    if (!newPrinciple.trim()) return;
    setSaving(true);
    await addPrinciple(book.id, newPrinciple);
    setNewPrinciple("");
    setSaving(false);
  }

  function startEdit(principleId: string, content: string) {
    setEditingId(principleId);
    setEditContent(content);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSaving(true);
    await updatePrinciple(book.id, editingId, editContent);
    setEditingId(null);
    setSaving(false);
  }

  async function handleApplied(value: boolean) {
    await setApplied(book.id, value);
  }

  async function handleToggleStatus() {
    await setStatus(book.id, book.status === "en_cours" ? "termine" : "en_cours");
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-16 h-20 object-cover rounded-lg shrink-0 border border-border"
              />
            ) : (
              <div className="w-16 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl leading-tight">{book.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant={book.status === "termine" ? "default" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={handleToggleStatus}
                >
                  {book.status === "termine" ? "Terminé" : "En cours"}
                </Badge>
                {book.applied && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/50">
                    Appliqué ✓
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Deadline */}
        {book.deadline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Deadline</span>
              </div>
              <span className={cn(
                "font-medium",
                daysLeft === null ? "text-muted-foreground"
                : daysLeft < 0 ? "text-red-500"
                : daysLeft <= 7 ? "text-amber-500"
                : "text-foreground"
              )}>
                {daysLeft === null ? "—"
                  : daysLeft < 0 ? `${Math.abs(daysLeft)}j de retard`
                  : daysLeft === 0 ? "Aujourd'hui !"
                  : `À terminer dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Principes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            🧠 Préceptes retenus
            <span className="text-xs font-normal text-muted-foreground">
              ({book.principles.length})
            </span>
          </h3>

          {book.principles.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Aucun précepte ajouté. Note les enseignements clés du livre.
            </p>
          )}

          <div className="space-y-2.5">
            {book.principles.map((p, idx) => (
              <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-3.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  {editingId === p.id ? (
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <p className="text-sm leading-relaxed flex-1">{p.content}</p>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(p.id, p.content)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removePrinciple(book.id, p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter un précepte */}
          <div className="space-y-2">
            <Textarea
              placeholder="Ajouter un précepte retenu..."
              value={newPrinciple}
              onChange={(e) => setNewPrinciple(e.target.value)}
              className="min-h-[80px] text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddPrinciple();
              }}
            />
            <Button
              size="sm" variant="outline"
              onClick={handleAddPrinciple}
              disabled={!newPrinciple.trim() || saving}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ajouter le précepte
            </Button>
          </div>
        </div>

        {/* Application réelle */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 sticky bottom-0 mt-2">
          <div>
            <p className="text-sm font-semibold">✅ Application réelle</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              As-tu appliqué les préceptes de ce livre ?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={book.applied ? "default" : "outline"}
              onClick={() => handleApplied(true)}
              className={cn(book.applied && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600")}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Oui
            </Button>
            <Button
              size="sm"
              variant={!book.applied ? "destructive" : "outline"}
              onClick={() => handleApplied(false)}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Non
            </Button>
            {book.applied && (
              <span className="text-xs text-emerald-600 font-medium">
                Théorie → Pratique ✓
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
