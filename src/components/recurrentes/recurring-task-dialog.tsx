"use client";

import { useState } from "react";
import { useRecurrentesStore, type RecurringTask } from "@/stores/use-recurrentes-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecurringTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: RecurringTask;
}

export function RecurringTaskDialog({ open, onClose, task }: RecurringTaskDialogProps) {
  const { addTask, updateTask } = useRecurrentesStore();

  const [name, setName] = useState(task?.name ?? "");
  const [duration, setDuration] = useState(String(task?.duration ?? 60));
  const [frequency, setFrequency] = useState<"daily" | "weekly">(task?.frequency ?? "daily");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const durationNum = parseInt(duration) || 60;
    if (task) {
      updateTask(task.id, { name: name.trim(), duration: durationNum, frequency });
    } else {
      addTask({ name: name.trim(), duration: durationNum, frequency });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{task ? "Modifier la tâche" : "Nouvelle tâche récurrente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              placeholder="Ex: 1h veille informatique"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="5"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-24"
              />
              <div className="flex gap-1 flex-wrap">
                {[30, 60, 90, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(String(d))}
                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    {d >= 60 ? `${d / 60}h` : `${d}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fréquence</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as "daily" | "weekly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{task ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
