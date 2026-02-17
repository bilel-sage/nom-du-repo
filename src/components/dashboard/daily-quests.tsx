"use client";

import { cn } from "@/lib/utils";
import { type DashboardQuest } from "@/stores/use-dashboard-store";
import { Badge } from "@/components/ui/badge";
import { Swords, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

function getPriorityLabel(urgency: number, importance: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const score = urgency * importance;
  if (score >= 12) return { label: "Critique", variant: "destructive" };
  if (score >= 8) return { label: "Important", variant: "default" };
  if (score >= 4) return { label: "Modéré", variant: "secondary" };
  return { label: "Normal", variant: "outline" };
}

interface DailyQuestsProps {
  quests: DashboardQuest[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  // Sort by priority score desc
  const sorted = [...quests].sort((a, b) => {
    const scoreA = a.urgency * a.importance;
    const scoreB = b.urgency * b.importance;
    return scoreB - scoreA;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Quêtes actives</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {quests.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">Aucune quête active. Tout est accompli !</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sorted.map((quest) => {
            const priority = getPriorityLabel(quest.urgency, quest.importance);
            return (
              <div
                key={quest.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="flex-1 text-sm truncate">{quest.title}</span>
                <Badge variant={priority.variant} className="text-[10px] shrink-0">
                  {priority.label}
                </Badge>
                <span className="text-xs text-primary font-mono shrink-0">
                  +{quest.xp_reward}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/quests"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
      >
        Voir toutes les quêtes <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
