"use client";

import { type Profile } from "@/stores/use-profile-store";
import { getLevelFromXP, STAT_COLORS } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function getLevelTitle(level: number): string {
  if (level >= 50) return "Légende Éternelle";
  if (level >= 30) return "Grand Maître";
  if (level >= 20) return "Champion";
  if (level >= 15) return "Vétéran";
  if (level >= 10) return "Guerrier";
  if (level >= 5) return "Aventurier";
  return "Recrue";
}

function getLevelTitleColor(level: number): string {
  if (level >= 50) return "text-amber-400";
  if (level >= 30) return "text-purple-400";
  if (level >= 20) return "text-blue-400";
  if (level >= 10) return "text-emerald-400";
  return "text-muted-foreground";
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  bg: string;
}

function StatBar({ label, value, max, color, bg }: StatBarProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-semibold", color)}>{label}</span>
        <span className="text-sm font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", bg)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface CharacterCardProps {
  profile: Profile;
}

export function CharacterCard({ profile }: CharacterCardProps) {
  const { level, currentXP, nextLevelXP, progress } = getLevelFromXP(profile.total_xp);
  const title = getLevelTitle(level);
  const titleColor = getLevelTitleColor(level);

  const stats = [
    { key: "eloquence" as const, value: profile.stat_eloquence },
    { key: "force" as const, value: profile.stat_force },
    { key: "agilite" as const, value: profile.stat_agilite },
  ];
  const maxStat = Math.max(...stats.map((s) => s.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Top banner */}
      <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-card shadow-lg">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="pt-12 px-6 pb-6 space-y-6">
        {/* Identity */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.username}</h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
              <Shield className="w-3 h-3" />
              Nv.{level}
            </div>
          </div>
          <p className={cn("text-sm font-medium flex items-center gap-1 mt-0.5", titleColor)}>
            <Sparkles className="w-3.5 h-3.5" />
            {title}
          </p>
        </div>

        {/* XP bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expérience</span>
            <span className="flex items-center gap-1 font-mono text-primary font-medium">
              <Zap className="w-3.5 h-3.5" />
              {profile.total_xp.toLocaleString()} XP
            </span>
          </div>
          <Progress value={progress * 100} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentXP} XP</span>
            <span>Prochain niveau : {nextLevelXP} XP</span>
          </div>
        </div>

        {/* RPG Stats */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Statistiques
          </h3>
          {stats.map((stat) => {
            const info = STAT_COLORS[stat.key];
            return (
              <StatBar
                key={stat.key}
                label={info.label}
                value={stat.value}
                max={maxStat}
                color={info.color}
                bg={info.bg}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
