"use client";

import { type Profile, type XpLog, type SkillSummary } from "@/stores/use-profile-store";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  profile: Profile;
  xpLogs: XpLog[];
  skills: SkillSummary[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-xp",
    title: "Premier pas",
    description: "Gagnez votre premier XP",
    icon: "1",
    check: (ctx) => ctx.profile.total_xp > 0,
  },
  {
    id: "level-5",
    title: "Aventurier",
    description: "Atteignez le niveau 5",
    icon: "5",
    check: (ctx) => ctx.profile.level >= 5,
  },
  {
    id: "level-10",
    title: "Guerrier",
    description: "Atteignez le niveau 10",
    icon: "10",
    check: (ctx) => ctx.profile.level >= 10,
  },
  {
    id: "level-20",
    title: "Champion",
    description: "Atteignez le niveau 20",
    icon: "20",
    check: (ctx) => ctx.profile.level >= 20,
  },
  {
    id: "xp-1000",
    title: "Millénaire",
    description: "Accumulez 1 000 XP",
    icon: "1K",
    check: (ctx) => ctx.profile.total_xp >= 1000,
  },
  {
    id: "xp-10000",
    title: "Légende",
    description: "Accumulez 10 000 XP",
    icon: "10K",
    check: (ctx) => ctx.profile.total_xp >= 10000,
  },
  {
    id: "balanced",
    title: "Équilibre",
    description: "Ayez au moins 10 dans chaque stat",
    icon: "EQ",
    check: (ctx) =>
      ctx.profile.stat_eloquence >= 10 &&
      ctx.profile.stat_force >= 10 &&
      ctx.profile.stat_agilite >= 10,
  },
  {
    id: "specialist",
    title: "Spécialiste",
    description: "Atteignez 100 dans une stat",
    icon: "SP",
    check: (ctx) =>
      ctx.profile.stat_eloquence >= 100 ||
      ctx.profile.stat_force >= 100 ||
      ctx.profile.stat_agilite >= 100,
  },
  {
    id: "multi-skill",
    title: "Polyvalent",
    description: "Créez 3 compétences Deepwork",
    icon: "3+",
    check: (ctx) => ctx.skills.length >= 3,
  },
  {
    id: "apprentice",
    title: "Apprenti",
    description: "Atteignez Apprenti dans une compétence (10h)",
    icon: "AP",
    check: (ctx) => ctx.skills.some((s) => s.total_minutes >= 600),
  },
  {
    id: "adept",
    title: "Adepte",
    description: "Atteignez Adepte dans une compétence (50h)",
    icon: "AD",
    check: (ctx) => ctx.skills.some((s) => s.total_minutes >= 3000),
  },
  {
    id: "master",
    title: "Maître Légendaire",
    description: "Atteignez 500h dans une compétence",
    icon: "ML",
    check: (ctx) => ctx.skills.some((s) => s.total_minutes >= 30000),
  },
];

interface AchievementsProps {
  profile: Profile;
  xpLogs: XpLog[];
  skills: SkillSummary[];
}

export function Achievements({ profile, xpLogs, skills }: AchievementsProps) {
  const ctx: AchievementContext = { profile, xpLogs, skills };

  const earned = ACHIEVEMENTS.filter((a) => a.check(ctx));
  const locked = ACHIEVEMENTS.filter((a) => !a.check(ctx));

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Succès
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {earned.length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {earned.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs">
                {a.icon}
              </div>
              <span className="text-[10px] font-semibold leading-tight">{a.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {locked.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border text-center opacity-40"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold leading-tight text-muted-foreground">
                {a.title}
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight">
                {a.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
