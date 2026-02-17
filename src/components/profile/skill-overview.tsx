"use client";

import { type SkillSummary } from "@/stores/use-profile-store";
import { getSkillLevel } from "@/stores/use-deepwork-store";
import { getSkillTitleColor } from "@/lib/gamification";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillOverviewProps {
  skills: SkillSummary[];
}

export function SkillOverview({ skills }: SkillOverviewProps) {
  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-blue-500" />
          Maîtrise des compétences
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune compétence ajoutée.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
        <Timer className="w-4 h-4 text-blue-500" />
        Maîtrise des compétences
      </h3>

      <div className="space-y-3">
        {skills.map((skill) => {
          const info = getSkillLevel(skill.total_minutes);
          const hours = Math.floor(skill.total_minutes / 60);
          const titleColor = getSkillTitleColor(skill.total_minutes);

          return (
            <div key={skill.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: skill.color }}
                  />
                  <span className="text-sm font-medium truncate">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs font-medium", titleColor)}>
                    {info.title}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{hours}h</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${info.progress * 100}%`,
                    backgroundColor: skill.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
