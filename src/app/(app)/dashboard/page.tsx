"use client";

import { useEffect, useState } from "react";
import { useAccueilStore } from "@/stores/use-accueil-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Home, Brain, Loader2 } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function NouvelleNoteDialog() {
  const addNote = useAccueilStore((s) => s.addNote);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await addNote(text);
    setLoading(false);
    setText("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle pensée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vide-Tête</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <Textarea
            autoFocus
            placeholder="Écris ta pensée, ton idée, ce qui t'occupe l'esprit…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="resize-none"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(); }}
          />
          <p className="text-xs text-muted-foreground">Ctrl + Entrée pour enregistrer</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={!text.trim() || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AccueilPage() {
  const { notes, loading, fetchNotes, deleteNote } = useAccueilStore();

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          Accueil
        </h1>
      </div>

      {/* Citation */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center">
        <p className="text-lg font-semibold leading-relaxed text-foreground">
          "Tout est possible à celui qui prie, patiente, et n'abandonne jamais."
        </p>
      </div>

      {/* Vide-Tête */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">Vide-Tête</h2>
            {notes.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            )}
          </div>
          <NouvelleNoteDialog />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <Brain className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune pensée enregistrée.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cliquez sur "Nouvelle pensée" pour vider votre tête.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-4 hover:border-border/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{note.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">{formatDate(note.created_at)}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 shrink-0 mt-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
