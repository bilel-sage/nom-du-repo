"use client";

import { useState } from "react";
import { useDeepworkStore, type SkillInsert } from "@/stores/use-deepwork-store";
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
  { value: "#f59e0b", label: "Ambre" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#10b981", label: "Vert" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f97316", label: "Orange" },
  { value: "#ec4899", label: "Rose" },
];

const STAT_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "eloquence", label: "Éloquence" },
  { value: "force", label: "Force" },
  { value: "agilite", label: "Agilité" },
];

export function SkillDialog() {
  const addSkill = useDeepworkStore((s) => s.addSkill);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#f59e0b");
  const [statType, setStatType] = useState("none");

  const resetForm = () => {
    setName("");
    setColor("#f59e0b");
    setStatType("none");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const skill: SkillInsert = {
      name: name.trim(),
      color,
      stat_type: statType === "none" ? null : (statType as "eloquence" | "force" | "agilite"),
    };

    await addSkill(skill);
    setLoading(false);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nouvelle compétence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle compétence</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="sk-name">Nom</Label>
            <Input
              id="sk-name"
              placeholder="Ex: Programmation, Lecture, Design..."
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
