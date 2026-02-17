"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/stores/use-profile-store";
import { CharacterCard } from "@/components/profile/character-card";
import { XpHistory } from "@/components/profile/xp-history";
import { SkillOverview } from "@/components/profile/skill-overview";
import { Achievements } from "@/components/profile/achievements";
import { User, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, xpLogs, skills, loading, error, fetchProfile, fetchXpLogs, fetchSkills } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchXpLogs(30);
    fetchSkills();
  }, [fetchProfile, fetchXpLogs, fetchSkills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3 max-w-md">
          {error ?? "Profil introuvable. Vérifiez que la migration SQL (002) a été exécutée dans Supabase."}
        </div>
        <button
          onClick={() => fetchProfile()}
          className="text-sm text-primary hover:underline font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Profil RPG
        </h1>
        <p className="text-muted-foreground mt-1">
          Votre identité de guerrier intellectuel.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left — Character card */}
        <div className="space-y-6">
          <CharacterCard profile={profile} />
          <SkillOverview skills={skills} />
        </div>

        {/* Right — History + Achievements */}
        <div className="space-y-6">
          <Achievements profile={profile} xpLogs={xpLogs} skills={skills} />
          <XpHistory logs={xpLogs} />
        </div>
      </div>
    </div>
  );
}
