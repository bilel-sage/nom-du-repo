"use client";

import { type Quest, useQuestStore } from "@/stores/use-quest-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Zap, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAT_COLORS } from "@/lib/gamification";

function getPriorityInfo(urgency: number, importance: number) {
  const score = urgency * importance;
  if (score >= 12) return { label: "Critique", variant: "destructive" as const, glow: true };
  if (score >= 8) return { label: "Important", variant: "default" as const, glow: false };
  if (score >= 4) return { label: "Modéré", variant: "secondary" as const, glow: false };
  return { label: "Normal", variant: "outline" as const, glow: false };
}

function formatDeadline(deadline: string | null): { text: string; urgent: boolean } | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return { text: "En retard", urgent: true };
  if (diffHours < 24) return { text: `${Math.floor(diffHours)}h restantes`, urgent: true };
  if (diffHours < 48) return { text: "Demain", urgent: false };

  return {
    text: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    urgent: false,
  };
}

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const { toggleComplete, deleteQuest } = useQuestStore();
  const priority = getPriorityInfo(quest.urgency, quest.importance);
  const deadline = formatDeadline(quest.deadline);
  const statInfo = quest.stat_type ? STAT_COLORS[quest.stat_type] : null;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl border transition-all",
        quest.is_completed
          ? "border-border/50 bg-muted/30 opacity-60"
          : priority.glow
          ? "border-destructive/30 bg-card hover:shadow-md hover:shadow-destructive/5"
          : "border-border bg-card hover:shadow-md hover:border-border/80"
      )}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={quest.is_completed}
          onCheckedChange={() => toggleComplete(quest.id)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "text-sm font-medium leading-tight",
              quest.is_completed && "line-through text-muted-foreground"
            )}
          >
            {quest.title}
          </span>
        </div>

        {quest.description && !quest.is_completed && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {quest.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant={priority.variant} className="text-[10px]">
            {priority.label}
          </Badge>

          {statInfo && (
            <span className={cn("text-[10px] font-medium", statInfo.color)}>
              {statInfo.label}
            </span>
          )}

          {deadline && (
            <span className={cn(
              "flex items-center gap-0.5 text-[10px]",
              deadline.urgent ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {deadline.text}
            </span>
          )}

          <span className="flex items-center gap-0.5 text-[10px] text-primary font-mono font-medium ml-auto">
            <Zap className="w-3 h-3" />
            +{quest.xp_reward} XP
          </span>
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => deleteQuest(quest.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
