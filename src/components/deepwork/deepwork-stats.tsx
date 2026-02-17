"use client";

import { useDeepworkStore } from "@/stores/use-deepwork-store";
import { Timer, Zap, Target, TrendingUp } from "lucide-react";

export function DeepworkStats() {
  const { skills, sessions } = useDeepworkStore();

  const totalMinutes = skills.reduce((sum, s) => sum + s.total_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => s.started_at.startsWith(today))
    .reduce((sum, s) => sum + s.duration_min, 0);

  const todayXP = sessions
    .filter((s) => s.started_at.startsWith(today))
    .reduce((sum, s) => sum + s.xp_earned, 0);

  // 7-day average
  const last7 = new Date();
  last7.setDate(last7.getDate() - 7);
  const weekSessions = sessions.filter((s) => new Date(s.started_at) >= last7);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration_min, 0);
  const avgDaily = Math.round(weekMinutes / 7);

  const stats = [
    {
      label: "Aujourd'hui",
      value: todayMinutes >= 60
        ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`
        : `${todayMinutes}min`,
      icon: Timer,
      color: "text-primary",
    },
    {
      label: "XP aujourd'hui",
      value: `+${todayXP}`,
      icon: Zap,
      color: "text-amber-500",
    },
    {
      label: "Moy. / jour",
      value: avgDaily >= 60
        ? `${Math.floor(avgDaily / 60)}h ${avgDaily % 60}m`
        : `${avgDaily}min`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Total cumulé",
      value: `${totalHours}h`,
      icon: Target,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
