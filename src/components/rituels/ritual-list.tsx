"use client";

import { useState } from "react";
import { useRituelsStore, type RitualZone } from "@/stores/use-rituels-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Check, Plus, Trash2, Pencil, RotateCcw, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function RitualRow({ zone, id, text, done }: { zone: RitualZone; id: string; text: string; done: boolean }) {
  const { toggleRitual, editRitual, deleteRitual } = useRituelsStore();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);

  const save = () => {
    if (val.trim()) editRitual(zone, id, val);
    setEditing(false);
  };

  return (
    <div className={cn("group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors", done && "opacity-60")}>
      <button
        onClick={() => toggleRitual(zone, id)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          done
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border hover:border-primary"
        )}
      >
        {done && <Check className="w-3 h-3" />}
      </button>

      {editing ? (
        <>
          <Input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            className="h-7 text-sm px-2 flex-1"
          />
        </>
      ) : (
        <span className={cn("flex-1 text-sm", done && "line-through text-muted-foreground")}>
          {text}
        </span>
      )}

      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => deleteRitual(zone, id)} className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function AddRitualRow({ zone }: { zone: RitualZone }) {
  const addRitual = useRituelsStore((s) => s.addRitual);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const submit = () => {
    if (text.trim()) addRitual(zone, text);
    setText("");
    setOpen(false);
  };

  if (open) {
    return (
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="Nom du rituel…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          className="h-9"
        />
        <Button size="sm" onClick={submit} disabled={!text.trim()}>Ajouter</Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>✕</Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Ajouter un rituel
    </button>
  );
}

export function RitualList({ zone, label }: { zone: RitualZone; label: string }) {
  const { rituals, resetZone } = useRituelsStore();
  const list = rituals[zone];
  const doneCount = list.filter((r) => r.done).length;
  const progress = list.length > 0 ? (doneCount / list.length) * 100 : 0;
  const allDone = list.length > 0 && doneCount === list.length;

  return (
    <div className="space-y-5">
      {/* Progress */}
      {list.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {doneCount}/{list.length} accomplis
            </span>
            <div className="flex items-center gap-2">
              {allDone && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Rituel complet !
                </span>
              )}
              <button
                onClick={() => resetZone(zone)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {list.map((r) => (
          <RitualRow key={r.id} zone={zone} id={r.id} text={r.text} done={r.done} />
        ))}
        <AddRitualRow zone={zone} />
      </div>
    </div>
  );
}
