"use client";

import { cn } from "@/lib/utils";
import { getLevelFromXP, STAT_COLORS } from "@/lib/gamification";
import { type DashboardProfile } from "@/stores/use-dashboard-store";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap } from "lucide-react";

interface RpgStatsProps {
  profile: DashboardProfile;
}

export function RpgStats({ profile }: RpgStatsProps) {
  const { level, currentXP, nextLevelXP, progress } = getLevelFromXP(profile.total_xp);

  const stats = [
    { key: "eloquence" as const, value: profile.stat_eloquence },
    { key: "force" as const, value: profile.stat_force },
    { key: "agilite" as const, value: profile.stat_agilite },
  ];

  const maxStat = Math.max(...stats.map((s) => s.value), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Profil RPG</h3>
      </div>

      {/* Level + XP bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold text-sm">
              {level}
            </div>
            <div>
              <p className="text-sm font-semibold">Niveau {level}</p>
              <p className="text-xs text-muted-foreground">
                {currentXP} / {nextLevelXP} XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <Zap className="w-3.5 h-3.5" />
            {profile.total_xp.toLocaleString()} XP
          </div>
        </div>
        <Progress value={progress * 100} className="h-2" />
      </div>

      {/* Stat bars */}
      <div className="space-y-3">
        {stats.map((stat) => {
          const info = STAT_COLORS[stat.key];
          const percent = (stat.value / maxStat) * 100;
          return (
            <div key={stat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", info.color)}>{info.label}</span>
                <span className="text-muted-foreground font-mono">{stat.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", info.bg)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
