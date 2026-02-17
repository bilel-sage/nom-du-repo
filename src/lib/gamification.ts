// XP required to reach a given level: 100 * level^1.5
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Total XP required from level 1 to target level
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

// Get current level from total XP
export function getLevelFromXP(totalXP: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  let level = 1;
  let remaining = totalXP;

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }

  const nextLevelXP = xpForLevel(level);
  return {
    level,
    currentXP: remaining,
    nextLevelXP,
    progress: nextLevelXP > 0 ? remaining / nextLevelXP : 0,
  };
}

// Deepwork skill level titles
export function getSkillTitle(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours >= 500) return "Maître Légendaire";
  if (hours >= 200) return "Expert";
  if (hours >= 50) return "Adepte";
  if (hours >= 10) return "Apprenti";
  return "Novice";
}

export function getSkillTitleColor(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours >= 500) return "text-amber-400";
  if (hours >= 200) return "text-purple-400";
  if (hours >= 50) return "text-blue-400";
  if (hours >= 10) return "text-emerald-400";
  return "text-muted-foreground";
}

// Stat colors
export const STAT_COLORS = {
  eloquence: { color: "text-blue-500", bg: "bg-blue-500", label: "Éloquence" },
  force: { color: "text-red-500", bg: "bg-red-500", label: "Force" },
  agilite: { color: "text-emerald-500", bg: "bg-emerald-500", label: "Agilité" },
} as const;
