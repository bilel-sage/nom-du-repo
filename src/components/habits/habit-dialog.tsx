"use client";

import { useState } from "react";
import { useHabitStore, type HabitInsert } from "@/stores/use-habit-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STAT_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "eloquence", label: "Éloquence" },
  { value: "force", label: "Force" },
  { value: "agilite", label: "Agilité" },
];

export function HabitDialog() {
  const addHabit = useHabitStore((s) => s.addHabit);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [statType, setStatType] = useState("none");
  const [xpPerCheck, setXpPerCheck] = useState("5");

  const resetForm = () => {
    setName("");
    setColor("#6366f1");
    setStatType("none");
    setXpPerCheck("5");
    setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setLocalError("");

    const habit: HabitInsert = {
      name: name.trim(),
      color,
      stat_type: statType === "none" ? null : (statType as "eloquence" | "force" | "agilite"),
      xp_per_check: parseInt(xpPerCheck) || 5,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nouvelle habitude
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle habitude</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="h-name">Nom</Label>
            <Input
              id="h-name"
              placeholder="Ex: Méditation 10min"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c.value ? "scale-110" : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 0 2px var(--color-background), 0 0 0 4px ${c.value}` : undefined,
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Stat liée</Label>
              <Select value={statType} onValueChange={setStatType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="h-xp">XP par check</Label>
              <Input
                id="h-xp"
                type="number"
                min={1}
                max={50}
                value={xpPerCheck}
                onChange={(e) => setXpPerCheck(e.target.value)}
              />
            </div>
          </div>

          {localError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {localError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer l'habitude"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
