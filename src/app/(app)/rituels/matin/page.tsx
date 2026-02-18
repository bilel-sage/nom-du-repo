"use client";

import { RitualList } from "@/components/rituels/ritual-list";
import { Sun } from "lucide-react";

export default function RituelMatinPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-500" />
          Rituels Matin
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Démarrez chaque journée avec les mêmes actions fondatrices.
        </p>
      </div>
      <RitualList zone="matin" label="Matin" />
    </div>
  );
}
