"use client";

import { useState } from "react";
import { useQuestStore, type QuestInsert } from "@/stores/use-quest-store";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

const URGENCY_OPTIONS = [
  { value: "1", label: "Basse" },
  { value: "2", label: "Normale" },
  { value: "3", label: "Haute" },
  { value: "4", label: "Critique" },
];

const IMPORTANCE_OPTIONS = [
  { value: "1", label: "Mineure" },
  { value: "2", label: "Normale" },
  { value: "3", label: "Importante" },
  { value: "4", label: "Cruciale" },
];

const STAT_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "eloquence", label: "Éloquence" },
  { value: "force", label: "Force" },
  { value: "agilite", label: "Agilité" },
];

export function QuestDialog() {
  const addQuest = useQuestStore((s) => s.addQuest);
  const storeError = useQuestStore((s) => s.error);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("2");
  const [importance, setImportance] = useState("2");
  const [deadline, setDeadline] = useState("");
  const [statType, setStatType] = useState("none");
  const [xpReward, setXpReward] = useState("15");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrgency("2");
    setImportance("2");
    setDeadline("");
    setStatType("none");
    setXpReward("15");
    setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setLocalError("");

    const quest: QuestInsert = {
      title: title.trim(),
      description: description.trim() || null,
      urgency: parseInt(urgency),
      importance: parseInt(importance),
      deadline: deadline || null,
      stat_type: statType === "none" ? null : (statType as "eloquence" | "force" | "agilite"),
      xp_reward: parseInt(xpReward) || 15,
    };

    await addQuest(quest);
    setLoading(false);

    // Check if the store has an error after the operation
    const currentError = useQuestStore.getState().error;
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
          Nouvelle quête
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle quête</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="q-title">Titre</Label>
            <Input
              id="q-title"
              placeholder="Ex: Terminer le module Auth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-desc">Description (optionnel)</Label>
            <Textarea
              id="q-desc"
              placeholder="Détails de la quête..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Urgence</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Importance</Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="q-xp">Récompense XP</Label>
              <Input
                id="q-xp"
                type="number"
                min={5}
                max={100}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-deadline">Deadline (optionnel)</Label>
            <Input
              id="q-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
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
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer la quête"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
