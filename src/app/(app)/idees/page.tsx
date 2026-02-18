"use client";

import { useEffect, useState } from "react";
import { useIdeesStore } from "@/stores/use-idees-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, Plus, Trash2, Pencil, Loader2 } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function IdeeDialog({
  mode, defaultText = "", defaultNote = "", onSave, trigger,
}: {
  mode: "add" | "edit"; defaultText?: string; defaultNote?: string;
  onSave: (t: string, n: string) => Promise<void>; trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);
  const [note, setNote] = useState(defaultNote);
  const [loading, setLoading] = useState(false);

  const handleOpen = (v: boolean) => { setOpen(v); if (v) { setText(defaultText); setNote(defaultNote); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await onSave(text, note);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Nouvelle idée business" : "Modifier l'idée"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>L'idée</Label>
            <Input autoFocus placeholder="Ex: Application de suivi de dépenses" value={text}
              onChange={(e) => setText(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Note (optionnel)</Label>
            <Textarea placeholder="Description, contexte, potentiel…" value={note}
              onChange={(e) => setNote(e.target.value)} rows={3} className="resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={!text.trim() || loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : mode === "add" ? "Ajouter" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function IdeesPage() {
  const { idees, loading, fetchIdees, addIdee, editIdee, deleteIdee } = useIdeesStore();

  useEffect(() => { fetchIdees(); }, [fetchIdees]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />Idées Business
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Capturez chaque idée avant qu'elle disparaisse.</p>
        </div>
        <IdeeDialog mode="add" onSave={addIdee}
          trigger={<Button className="gap-2"><Plus className="w-4 h-4" />Nouvelle idée</Button>} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : idees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-14 text-center">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune idée enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {idees.map((idee, idx) => (
            <div key={idee.id} className="group flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/20 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium">{idee.text}</p>
                {idee.note && <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{idee.note}</p>}
                <p className="text-[11px] text-muted-foreground">{formatDate(idee.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <IdeeDialog mode="edit" defaultText={idee.text} defaultNote={idee.note}
                  onSave={(t, n) => editIdee(idee.id, t, n)}
                  trigger={<button className="p-1.5 text-muted-foreground hover:text-foreground rounded"><Pencil className="w-3.5 h-3.5" /></button>} />
                <button onClick={() => deleteIdee(idee.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
