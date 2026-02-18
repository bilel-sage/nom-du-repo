"use client";

import { useState } from "react";
import { useHabitStore, FIXED_CATEGORIES, type HabitInsert } from "@/stores/use-habit-store";
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
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#f97316", label: "Orange" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#10b981", label: "Vert" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f59e0b", label: "Ambre" },
  { value: "#ec4899", label: "Rose" },
];

interface HabitDialogProps {
  defaultCategory?: string;
  trigger?: React.ReactNode;
}

export function HabitDialog({ defaultCategory, trigger }: HabitDialogProps) {
  const addHabit = useHabitStore((s) => s.addHabit);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(
    defaultCategory
      ? (FIXED_CATEGORIES.find((c) => c.id === defaultCategory)?.color ?? "#6366f1")
      : "#6366f1"
  );

  const resetForm = () => {
    setName("");
    setColor(
      defaultCategory
        ? (FIXED_CATEGORIES.find((c) => c.id === defaultCategory)?.color ?? "#6366f1")
        : "#6366f1"
    );
    setLocalError("");
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setLocalError("");

    const habit: HabitInsert = {
      name: name.trim(),
      color,
      category: defaultCategory,
    };

    await addHabit(habit);
    setLoading(false);

    const currentError = useHabitStore.getState().error;
    if (currentError) {
      setLocalError(currentError);
      return;
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost" className="gap-1 h-7 px-2 text-muted-foreground hover:text-foreground">
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {defaultCategory
              ? `Nouvelle habitude — ${FIXED_CATEGORIES.find((c) => c.id === defaultCategory)?.label}`
              : "Nouvelle habitude"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="h-name">Nom de l'habitude</Label>
            <Input
              id="h-name"
              placeholder="Ex: Lecture 20min"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn("w-7 h-7 rounded-full transition-all", color === c.value ? "scale-110" : "hover:scale-105")}
                  style={{
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 0 2px var(--color-background), 0 0 0 3px ${c.value}` : undefined,
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {localError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {localError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
