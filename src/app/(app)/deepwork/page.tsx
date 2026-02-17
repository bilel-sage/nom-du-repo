"use client";

import { useEffect } from "react";
import { useDeepworkStore } from "@/stores/use-deepwork-store";
import { SkillDialog } from "@/components/deepwork/skill-dialog";
import { SkillCard } from "@/components/deepwork/skill-card";
import { DeepworkStats } from "@/components/deepwork/deepwork-stats";
import { Timer, Loader2, Inbox } from "lucide-react";

export default function DeepworkPage() {
  const { skills, sessions, loading, activeTimer, fetchSkills, fetchSessions } = useDeepworkStore();

  useEffect(() => {
    fetchSkills().then(() => fetchSessions(30));
  }, [fetchSkills, fetchSessions]);

  const activeSkill = activeTimer
    ? skills.find((s) => s.id === activeTimer.skillId)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Deepwork
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez votre temps de travail profond par compétence.
          </p>
        </div>
        <SkillDialog />
      </div>

      {/* Active session banner */}
      {activeSkill && activeTimer && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">
            Session en cours : <strong>{activeSkill.name}</strong>
          </span>
          <span className="ml-auto text-lg font-mono font-bold tabular-nums text-primary">
            {Math.floor(activeTimer.elapsed / 60).toString().padStart(2, "0")}:
            {(activeTimer.elapsed % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune compétence. Ajoutez votre premier domaine d'expertise.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <DeepworkStats />

          {/* Skills grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                sessions={sessions}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
