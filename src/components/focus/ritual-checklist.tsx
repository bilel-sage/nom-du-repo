"use client";

import { useFocusStore } from "@/stores/use-focus-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  CupSoda,
  AppWindow,
  Target,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  "smartphone-off": Smartphone,
  "cup-soda": CupSoda,
  "app-window": AppWindow,
  "target": Target,
  "headphones": Headphones,
};

export function RitualChecklist() {
  const { rituals, allRitualsChecked, toggleRitual } = useFocusStore();

  const checkedCount = rituals.filter((r) => r.checked).length;
  const progressPercent = (checkedCount / rituals.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rituel de concentration
        </h3>
        {allRitualsChecked && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Prêt
          </span>
        )}
      </div>

      <Progress value={progressPercent} className="h-1.5" />

      <div className="space-y-1">
        {rituals.map((ritual) => {
          const Icon = iconMap[ritual.icon] || Target;
          return (
            <label
              key={ritual.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                "hover:bg-accent",
                ritual.checked && "opacity-60"
              )}
            >
              <Checkbox
                checked={ritual.checked}
                onCheckedChange={() => toggleRitual(ritual.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                ritual.checked ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm transition-all",
                ritual.checked && "line-through text-muted-foreground"
              )}>
                {ritual.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
