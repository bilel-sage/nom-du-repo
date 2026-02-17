"use client";

import { type Skill, type DeepworkSession, useDeepworkStore, getSkillLevel } from "@/stores/use-deepwork-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Trash2, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSkillTitleColor } from "@/lib/gamification";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface SkillCardProps {
  skill: Skill;
  sessions: DeepworkSession[];
}

export function SkillCard({ skill, sessions }: SkillCardProps) {
  const { activeTimer, startTimer, stopTimer, deleteSkill } = useDeepworkStore();
  const isActive = activeTimer?.skillId === skill.id;
  const hasActiveTimer = activeTimer !== null;

  const levelInfo = getSkillLevel(skill.total_minutes);
  const titleColor = getSkillTitleColor(skill.total_minutes);
  const totalHours = Math.floor(skill.total_minutes / 60);

  // Recent sessions for this skill (last 7)
  const recentSessions = sessions
    .filter((s) => s.skill_id === skill.id)
    .slice(0, 5);

  // Today's total
  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => s.skill_id === skill.id && s.started_at.startsWith(today))
    .reduce((sum, s) => sum + s.duration_min, 0);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 space-y-4 transition-all",
        isActive
          ? "border-primary/40 shadow-lg shadow-primary/5"
          : "border-border hover:shadow-md hover:border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: skill.color }}
          >
            {skill.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{skill.name}</h3>
            <p className={cn("text-xs font-medium", titleColor)}>
              {levelInfo.title}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => deleteSkill(skill.id)}
          disabled={isActive}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Level progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Niveau {levelInfo.level} — {totalHours}h total
          </span>
          <span className="text-muted-foreground font-mono">
            → {levelInfo.nextHours}h
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${levelInfo.progress * 100}%`,
              backgroundColor: skill.color,
            }}
          />
        </div>
      </div>

      {/* Today stat */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Aujourd'hui : <strong className="text-foreground">{formatDuration(todayMinutes)}</strong>
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {todayMinutes * 2} XP
        </span>
      </div>

      {/* Timer / Start button */}
      {isActive ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-2xl font-mono font-bold tabular-nums text-primary">
              {formatElapsed(activeTimer.elapsed)}
            </span>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            onClick={stopTimer}
          >
            <Square className="w-3.5 h-3.5" />
            Arrêter
          </Button>
        </div>
      ) : (
        <Button
          className="w-full gap-2"
          onClick={() => startTimer(skill.id)}
          disabled={hasActiveTimer}
          style={{
            backgroundColor: hasActiveTimer ? undefined : skill.color,
          }}
        >
          <Play className="w-4 h-4" />
          Démarrer une session
        </Button>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Sessions récentes
          </p>
          {recentSessions.map((session) => {
            const date = new Date(session.started_at);
            return (
              <div
                key={session.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                <span className="font-mono">{formatDuration(session.duration_min)}</span>
                <span className="text-primary font-mono">+{session.xp_earned} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
