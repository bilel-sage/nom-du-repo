"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Timer,
  Sunrise,
  Sunset,
  Zap,
  CalendarDays,
  Target,
  Lightbulb,
  CheckSquare,
  BookOpenText,
  Briefcase,
  Flame,
  Clapperboard,
  Radio,
  Mic,
  Youtube,
  Grid2X2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModeStore } from "@/stores/use-mode-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroupDef {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const LEARNING_GROUPS: NavGroupDef[] = [
  {
    label: "Médias",
    icon: Radio,
    items: [
      { href: "/podcasts", label: "Podcasts", icon: Mic },
      { href: "/youtube",  label: "YouTube",  icon: Youtube },
    ],
  },
  {
    label: "Performance",
    icon: Flame,
    items: [
      { href: "/focus/matin", label: "Focus Matin", icon: Sunrise },
      { href: "/focus/soir",  label: "Focus Soir",  icon: Sunset },
    ],
  },
  {
    label: "Planification",
    icon: CalendarDays,
    items: [
      { href: "/agenda",    label: "Agenda",    icon: CalendarDays },
      { href: "/objectifs", label: "Objectifs", icon: Target },
    ],
  },
  {
    label: "Actions",
    icon: Zap,
    items: [
      { href: "/todo",      label: "To Do",     icon: CheckSquare },
      { href: "/do-it-now", label: "Do It Now", icon: Timer },
    ],
  },
  {
    label: "Clarté",
    icon: Lightbulb,
    items: [
      { href: "/idees",     label: "Idées",     icon: Lightbulb },
      { href: "/dashboard", label: "Vide Tête", icon: Home },
    ],
  },
  {
    label: "Création Vidéo",
    icon: Clapperboard,
    items: [
      { href: "/bilearning", label: "Bilearning", icon: BookOpenText },
    ],
  },
];

const BUSINESS_GROUPS: NavGroupDef[] = [
  {
    label: "Médias",
    icon: Radio,
    items: [
      { href: "/podcasts", label: "Podcasts", icon: Mic },
      { href: "/youtube",  label: "YouTube",  icon: Youtube },
    ],
  },
  {
    label: "Performance",
    icon: Flame,
    items: [
      { href: "/focus/matin-business", label: "Focus Matin", icon: Briefcase },
      { href: "/focus/soir-business",  label: "Focus Soir",  icon: Target },
    ],
  },
  {
    label: "Planification",
    icon: CalendarDays,
    items: [
      { href: "/agenda",    label: "Agenda",    icon: CalendarDays },
      { href: "/objectifs", label: "Objectifs", icon: Target },
    ],
  },
  {
    label: "Actions",
    icon: Zap,
    items: [
      { href: "/todo",      label: "To Do",     icon: CheckSquare },
      { href: "/do-it-now", label: "Do It Now", icon: Timer },
    ],
  },
  {
    label: "Clarté",
    icon: Lightbulb,
    items: [
      { href: "/idees",     label: "Idées Business", icon: Lightbulb },
      { href: "/dashboard", label: "Vide Tête",      icon: Home },
    ],
  },
  {
    label: "Création Vidéo",
    icon: Clapperboard,
    items: [
      { href: "/bilearning", label: "Bilearning", icon: BookOpenText },
    ],
  },
];

const LEARNING_TAB: NavItem[] = [
  { href: "/dashboard",   label: "Accueil", icon: Home },
  { href: "/todo",        label: "To Do",   icon: CheckSquare },
  { href: "/agenda",      label: "Agenda",  icon: CalendarDays },
  { href: "/focus/matin", label: "Focus",   icon: Sunrise },
];

const BUSINESS_TAB: NavItem[] = [
  { href: "/dashboard",            label: "Accueil", icon: Home },
  { href: "/todo",                 label: "To Do",   icon: CheckSquare },
  { href: "/agenda",               label: "Agenda",  icon: CalendarDays },
  { href: "/focus/matin-business", label: "Focus",   icon: Briefcase },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { mode } = useModeStore();
  const [showMore, setShowMore] = useState(false);

  const isLearning = mode === "learning";
  const drawerGroups = isLearning ? LEARNING_GROUPS : BUSINESS_GROUPS;
  const tabNav = isLearning ? LEARNING_TAB : BUSINESS_TAB;

  const isMoreActive =
    !tabNav.some((t) => pathname === t.href || pathname.startsWith(t.href + "/")) &&
    drawerGroups.some((g) => g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/")));

  return (
    <>
      {/* ── Bottom sheet "Plus" — rendu au niveau racine, hors du header ─── */}
      {showMore && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet remontant du bas */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl border-t border-border"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-base font-bold">Toutes les pages</span>
              <button
                onClick={() => setShowMore(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav en grille par groupe */}
            <div className="overflow-y-auto max-h-[55vh] px-4 pb-2 space-y-5">
              {drawerGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.label}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <GroupIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowMore(false)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center",
                              isActive
                                ? isLearning
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "bg-orange-500/10 border-orange-500/30 text-orange-600"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/20"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              isActive
                                ? isLearning ? "bg-primary/15" : "bg-orange-500/15"
                                : "bg-background"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom tab bar ─────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <nav className="flex items-center justify-around h-16 px-1">
          {tabNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors min-w-0",
                  isActive
                    ? isLearning ? "text-primary" : "text-orange-600"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Bouton Plus */}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors",
              isMoreActive || showMore
                ? isLearning ? "text-primary" : "text-orange-600"
                : "text-muted-foreground"
            )}
          >
            <Grid2X2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium">Plus</span>
          </button>
        </nav>
      </div>
    </>
  );
}
