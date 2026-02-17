"use client";

import { type XpLog } from "@/stores/use-profile-store";
import { STAT_COLORS } from "@/lib/gamification";
import { Zap, Swords, CalendarCheck, Timer, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  quest: { label: "Quête", icon: Swords, color: "text-primary" },
  habit: { label: "Habitude", icon: CalendarCheck, color: "text-emerald-500" },
  deepwork: { label: "Deepwork", icon: Timer, color: "text-blue-500" },
  focus: { label: "Focus", icon: Crosshair, color: "text-amber-500" },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface XpHistoryProps {
  logs: XpLog[];
}

export function XpHistory({ logs }: XpHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          Historique XP
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune activité XP enregistrée.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        Historique XP
      </h3>

      <div className="space-y-1">
        {logs.map((log) => {
          const source = SOURCE_INFO[log.source_type] ?? SOURCE_INFO.quest;
          const Icon = source.icon;
          const statInfo = log.stat_type ? STAT_COLORS[log.stat_type] : null;

          return (
            <div
              key={log.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-muted shrink-0")}>
                <Icon className={cn("w-4 h-4", source.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{source.label}</span>
                  {statInfo && (
                    <span className={cn("text-[10px] font-medium", statInfo.color)}>
                      {statInfo.label}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(log.created_at)}
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-primary shrink-0">
                +{log.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
