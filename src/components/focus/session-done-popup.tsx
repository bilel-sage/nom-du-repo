"use client";

import { type FocusZone, type FocusMode, useFocusStoreByZone } from "@/stores/use-focus-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Zap } from "lucide-react";

interface SessionDonePopupProps {
  zone: FocusZone;
  modeKey: FocusMode;
}

export function SessionDonePopup({ zone, modeKey }: SessionDonePopupProps) {
  const useStore = useFocusStoreByZone(zone, modeKey);
  const { showDonePopup, setShowDonePopup, totalRounds, reset } = useStore();

  function handleClose() {
    setShowDonePopup(false);
    reset();
  }

  return (
    <Dialog open={showDonePopup} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center gap-5 py-4">
          {/* Icône */}
          <div className="w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>

          {/* Titre */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Félicitations !</h2>
            <p className="text-muted-foreground mt-1">
              Vous avez terminé votre session.
            </p>
          </div>

          {/* Citation */}
          <div className="bg-muted/60 rounded-xl px-5 py-4 w-full">
            <p className="text-base font-semibold text-foreground">
              "Discipline = liberté."
            </p>
          </div>

          {/* Badge du jour */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 w-full">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-600">Badge du jour débloqué !</p>
              <p className="text-xs text-muted-foreground">{totalRounds} rounds complétés aujourd'hui</p>
            </div>
          </div>

          {/* CTA */}
          <Button className="w-full" size="lg" onClick={handleClose}>
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
