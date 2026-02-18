"use client";

import { useState } from "react";
import { type FocusZone, useFocusStoreByZone } from "@/stores/use-focus-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RitualChecklistProps {
  zone: FocusZone;
}

export function RitualChecklist({ zone }: RitualChecklistProps) {
  const useStore = useFocusStoreByZone(zone);
  const { rituals, allRitualsChecked, toggleRitual, addRitual, editRitual, removeRitual } =
    useStore();

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const checkedCount = rituals.filter((r) => r.checked).length;
  const progressPercent = rituals.length > 0 ? (checkedCount / rituals.length) * 100 : 0;

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditingValue(label);
  };

  const confirmEdit = () => {
    if (editingId && editingValue.trim()) {
      editRitual(editingId, editingValue.trim());
    }
    setEditingId(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleAdd = () => {
    if (newLabel.trim()) {
      addRitual(newLabel.trim());
      setNewLabel("");
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rituel {zone === "matin" ? "du matin" : "du soir"}
        </h3>
        <div className="flex items-center gap-2">
          {allRitualsChecked && !editMode && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Prêt
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-7 h-7 transition-colors",
              editMode
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              setEditMode((v) => !v);
              setEditingId(null);
              setShowAdd(false);
            }}
            title={editMode ? "Terminer l'édition" : "Modifier les rituels"}
          >
            <Settings2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {!editMode && <Progress value={progressPercent} className="h-1.5" />}

      {/* Ritual items */}
      <div className="space-y-1">
        {rituals.map((ritual) => (
          <div
            key={ritual.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              editMode ? "hover:bg-accent" : "hover:bg-accent cursor-pointer",
              !editMode && ritual.checked && "opacity-60"
            )}
          >
            {!editMode && (
              <Checkbox
                checked={ritual.checked}
                onCheckedChange={() => toggleRitual(ritual.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
              />
            )}

            {editMode && editingId === ritual.id ? (
              /* Inline edit field */
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-emerald-500"
                  onClick={confirmEdit}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground"
                  onClick={cancelEdit}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              /* Normal display */
              <>
                <span
                  className={cn(
                    "flex-1 text-sm transition-all",
                    !editMode && ritual.checked && "line-through text-muted-foreground"
                  )}
                  onClick={() => !editMode && toggleRitual(ritual.id)}
                >
                  {ritual.label}
                </span>
                {editMode && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(ritual.id, ritual.label)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRitual(ritual.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add ritual (edit mode only) */}
      {editMode && (
        <div className="pt-1">
          {showAdd ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nouveau rituel..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setShowAdd(false);
                    setNewLabel("");
                  }
                }}
                className="h-8 text-sm flex-1"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-emerald-500"
                onClick={handleAdd}
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground"
                onClick={() => {
                  setShowAdd(false);
                  setNewLabel("");
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs h-8"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un rituel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
