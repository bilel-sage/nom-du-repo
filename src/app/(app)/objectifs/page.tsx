"use client";

import { useState } from "react";
import { useObjectifsStore } from "@/stores/use-objectifs-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2, Pencil, Check, CalendarClock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function daysUntil(deadline: string): number {
  const d = new Date(deadline + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function formatDeadline(deadline: string): string {
  return new Date(deadline + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function DeadlineBadge({ deadline, done }: { deadline: string; done: boolean }) {
  if (done) return null;
  const days = daysUntil(deadline);
  const urgent = days <= 3;
  const overdue = days < 0;

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
      overdue ? "bg-destructive/10 text-destructive"
        : urgent ? "bg-amber-500/10 text-amber-600"
        : "bg-muted text-muted-foreground"
    )}>
      {overdue ? <AlertCircle className="w-3 h-3" /> : <CalendarClock className="w-3 h-3" />}
      {overdue ? `Dépassé de ${Math.abs(days)}j`
        : days === 0 ? "Aujourd'hui"
        : days === 1 ? "Demain"
        : `${days} jours`}
    </div>
  );
}

function ObjectifDialog({
  mode,
  defaultTitle = "",
  defaultDeadline = "",
  onSave,
  trigger,
}: {
  mode: "add" | "edit";
  defaultTitle?: string;
  defaultDeadline?: string;
  onSave: (title: string, deadline: string) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [deadline, setDeadline] = useState(defaultDeadline);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) { setTitle(defaultTitle); setDeadline(defaultDeadline); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onSave(title, deadline);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Nouvel objectif" : "Modifier l'objectif"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="obj-title">Objectif</Label>
            <Input
              id="obj-title"
              autoFocus
              placeholder="Ex: Lire 12 livres cette année"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obj-deadline">Échéance</Label>
            <Input
              id="obj-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={!title.trim() || !deadline}>
              {mode === "add" ? "Ajouter" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ObjectifsPage() {
  const { objectifs, addObjectif, toggleObjectif, deleteObjectif, editObjectif } = useObjectifsStore();

  const active = objectifs.filter((o) => !o.done).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const done = objectifs.filter((o) => o.done);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Objectifs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Vos ambitions avec une date butoir.</p>
        </div>
        <ObjectifDialog
          mode="add"
          onSave={(title, deadline) => addObjectif(title, deadline)}
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          }
        />
      </div>

      {/* Objectifs actifs */}
      {active.length === 0 && done.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-14 text-center">
          <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun objectif. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((obj) => (
            <div key={obj.id} className="group flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/20 transition-colors">
              <button
                onClick={() => toggleObjectif(obj.id)}
                className="mt-0.5 w-5 h-5 rounded-full border-2 border-border hover:border-primary flex items-center justify-center shrink-0 transition-colors"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-medium">{obj.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{formatDeadline(obj.deadline)}</span>
                  <DeadlineBadge deadline={obj.deadline} done={obj.done} />
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ObjectifDialog
                  mode="edit"
                  defaultTitle={obj.title}
                  defaultDeadline={obj.deadline}
                  onSave={(title, deadline) => editObjectif(obj.id, title, deadline)}
                  trigger={
                    <button className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  }
                />
                <button
                  onClick={() => deleteObjectif(obj.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {done.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wider pt-2">Accomplis</p>
              {done.map((obj) => (
                <div key={obj.id} className="group flex items-start gap-4 rounded-xl border border-border bg-card/50 px-5 py-4 opacity-60">
                  <button
                    onClick={() => toggleObjectif(obj.id)}
                    className="mt-0.5 w-5 h-5 rounded-full bg-primary border-2 border-primary flex items-center justify-center shrink-0"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-through text-muted-foreground">{obj.title}</p>
                  </div>
                  <button
                    onClick={() => deleteObjectif(obj.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
