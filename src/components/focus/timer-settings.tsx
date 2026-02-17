"use client";

import { useFocusStore } from "@/stores/use-focus-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  label: string;
  value: number;
  unit: string;
  onDecrease: () => void;
  onIncrease: () => void;
  min: number;
  max: number;
}

function SettingRow({ label, value, unit, onDecrease, onIncrease, min, max }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 rounded-md"
          onClick={onDecrease}
          disabled={value <= min}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-14 text-center text-sm font-mono font-medium tabular-nums">
          {value} {unit}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="w-7 h-7 rounded-md"
          onClick={onIncrease}
          disabled={value >= max}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function TimerSettings() {
  const {
    workDuration, breakDuration, longBreakDuration, totalRounds, phase,
    setWorkDuration, setBreakDuration, setLongBreakDuration, setTotalRounds,
  } = useFocusStore();

  const disabled = phase !== "idle" && phase !== "done";

  return (
    <div className={cn("space-y-4", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Réglages
        </h3>
      </div>

      <div className="space-y-3">
        <SettingRow
          label="Focus"
          value={workDuration}
          unit="min"
          min={5}
          max={90}
          onDecrease={() => setWorkDuration(workDuration - 5)}
          onIncrease={() => setWorkDuration(workDuration + 5)}
        />
        <SettingRow
          label="Pause"
          value={breakDuration}
          unit="min"
          min={1}
          max={15}
          onDecrease={() => setBreakDuration(breakDuration - 1)}
          onIncrease={() => setBreakDuration(breakDuration + 1)}
        />
        <SettingRow
          label="Pause longue"
          value={longBreakDuration}
          unit="min"
          min={5}
          max={30}
          onDecrease={() => setLongBreakDuration(longBreakDuration - 5)}
          onIncrease={() => setLongBreakDuration(longBreakDuration + 5)}
        />
        <SettingRow
          label="Rounds"
          value={totalRounds}
          unit=""
          min={1}
          max={8}
          onDecrease={() => setTotalRounds(totalRounds - 1)}
          onIncrease={() => setTotalRounds(totalRounds + 1)}
        />
      </div>
    </div>
  );
}
