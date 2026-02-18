"use client";

import { RitualList } from "@/components/rituels/ritual-list";
import { Moon } from "lucide-react";

export default function RituelSoirPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-400" />
          Rituels Soir
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Clôturez chaque journée avec clarté et sérénité.
        </p>
      </div>
      <RitualList zone="soir" label="Soir" />
    </div>
  );
}
