"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { LayoutDashboard, Swords, Flame, Timer, Zap, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RpgStats } from "@/components/dashboard/rpg-stats";
import { DailyQuests } from "@/components/dashboard/daily-quests";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { HabitStreak } from "@/components/dashboard/habit-streak";

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function DashboardPage() {
  const {
    profile, quests, habits, habitLogs, deepworkSessions, xpLogs,
    loading, error, fetchAll,
    todayXp, todayDeepworkMinutes, bestStreak,
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

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
          onClick={() => fetchAll()}
          className="text-sm text-primary hover:underline font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const todayDw = todayDeepworkMinutes();
  const todayXpVal = todayXp();
  const streak = bestStreak();
  const activeQuests = quests.filter((q) => !q.is_completed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          Cockpit
        </h1>
        <p className="text-muted-foreground mt-1">
          {greeting} <strong>{profile.username}</strong>, prêt à conquérir cette journée.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Quêtes actives"
          value={`${activeQuests}`}
          subtitle={activeQuests === 0 ? "Tout est fait !" : `${activeQuests} en cours`}
          icon={Swords}
          accent="text-primary"
        />
        <StatCard
          title="Meilleur streak"
          value={streak > 0 ? `${streak}j` : "—"}
          subtitle={streak > 0 ? "Jours consécutifs" : "Aucun streak"}
          icon={Flame}
          accent="text-amber-500"
        />
        <StatCard
          title="Deepwork"
          value={todayDw > 0 ? formatMinutes(todayDw) : "—"}
          subtitle="Aujourd'hui"
          icon={Timer}
          accent="text-blue-500"
        />
        <StatCard
          title="XP aujourd'hui"
          value={todayXpVal > 0 ? `+${todayXpVal}` : "0"}
          subtitle={`Total : ${profile.total_xp.toLocaleString()} XP`}
          icon={Zap}
          accent="text-primary"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left */}
        <div className="space-y-6">
          <DailyQuests quests={quests} />
          <ActivityHeatmap sessions={deepworkSessions} />
        </div>

        {/* Right */}
        <div className="space-y-6">
          <RpgStats profile={profile} />
          <HabitStreak habits={habits} logs={habitLogs} />
        </div>
      </div>
    </div>
  );
}
