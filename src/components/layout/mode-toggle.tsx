"use client";

import { useState } from "react";
import { GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModeStore, type AppMode } from "@/stores/use-mode-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { mode, setMode } = useModeStore();
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null);

  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  function handleClick(target: AppMode) {
    if (target === mode) return;
    const wrongDay =
      (target === "business" && !isWeekend) ||
      (target === "learning" && isWeekend);
    if (wrongDay) {
      setPendingMode(target);
    } else {
      setMode(target);
    }
  }

  function confirmSwitch() {
    if (pendingMode) {
      setMode(pendingMode);
      setPendingMode(null);
    }
  }

  const warningText =
    pendingMode === "business"
      ? "Le mode Business est réservé au week-end. Continuer quand même ?"
      : "Le mode Learning est réservé à la semaine. Continuer quand même ?";

  return (
    <>
      <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-muted border border-border">
        <button
          onClick={() => handleClick("learning")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200",
            mode === "learning"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="w-3 h-3" />
          Learning
        </button>
        <button
          onClick={() => handleClick("business")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200",
            mode === "business"
              ? "bg-orange-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="w-3 h-3" />
          Business
        </button>
      </div>

      <Dialog open={pendingMode !== null} onOpenChange={(open) => !open && setPendingMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>⚠️ Changer de mode ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{warningText}</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendingMode(null)}>
              Annuler
            </Button>
            <Button
              onClick={confirmSwitch}
              className={cn(
                pendingMode === "business"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
