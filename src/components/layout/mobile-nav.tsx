"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Timer,
  Sunrise,
  Sunset,
  Menu,
  Zap,
  CalendarDays,
  Target,
  Lightbulb,
  CheckSquare,
  BookOpenText,
  Briefcase,
  Flame,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import { useModeStore } from "@/stores/use-mode-store";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
    label: "Actions",
    icon: Zap,
    items: [
      { href: "/todo",       label: "To Do",     icon: CheckSquare },
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
    label: "Performance",
    icon: Flame,
    items: [
      { href: "/focus/matin", label: "Focus Matin Learn", icon: Sunrise },
      { href: "/focus/soir",  label: "Focus Soir Learn",  icon: Sunset },
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
    label: "Création Vidéo",
    icon: Clapperboard,
    items: [
      { href: "/bilearning", label: "Bilearning", icon: BookOpenText },
    ],
  },
];

const BUSINESS_GROUPS: NavGroupDef[] = [
  {
    label: "Actions",
    icon: Zap,
    items: [
      { href: "/todo",       label: "To Do",     icon: CheckSquare },
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
    label: "Performance",
    icon: Flame,
    items: [
      { href: "/focus/matin-business", label: "Focus Matin Business", icon: Briefcase },
      { href: "/focus/soir-business",  label: "Focus Soir Business",  icon: Target },
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
    label: "Création Vidéo",
    icon: Clapperboard,
    items: [
      { href: "/bilearning", label: "Bilearning", icon: BookOpenText },
    ],
  },
];

const LEARNING_TAB = [
  { href: "/dashboard",    label: "Accueil",   icon: Home },
  { href: "/todo",         label: "To Do",     icon: CheckSquare },
  { href: "/agenda",       label: "Agenda",    icon: CalendarDays },
  { href: "/objectifs",    label: "Objectifs", icon: Target },
  { href: "/focus/matin", label: "Focus",     icon: Sunrise },
];

const BUSINESS_TAB = [
  { href: "/dashboard",             label: "Accueil",   icon: Home },
  { href: "/todo",                  label: "To Do",     icon: CheckSquare },
  { href: "/agenda",                label: "Agenda",    icon: CalendarDays },
  { href: "/objectifs",             label: "Objectifs", icon: Target },
  { href: "/focus/matin-business", label: "Focus",     icon: Briefcase },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const { mode } = useModeStore();

  const isLearning = mode === "learning";
  const drawerGroups = isLearning ? LEARNING_GROUPS : BUSINESS_GROUPS;
  const tabNav = isLearning ? LEARNING_TAB : BUSINESS_TAB;

  return (
    <>
      {/* Hamburger drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg text-white",
                isLearning ? "bg-blue-600" : "bg-orange-600"
              )}>
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">Biproductive</span>
            </div>
          </div>
          <nav className="p-2.5 space-y-3 overflow-y-auto">
            {drawerGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label}>
                  <div className="flex items-center gap-2 px-3 py-1 text-muted-foreground">
                    <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      {group.label}
                    </span>
                  </div>
                  <div className="ml-3.5 pl-2 border-l border-sidebar-border/60 space-y-0.5 py-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? isLearning
                                ? "bg-primary/10 text-primary"
                                : "bg-orange-500/10 text-orange-600"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                        >
                          <Icon className={cn(
                            "w-4 h-4",
                            isActive && (isLearning ? "text-primary" : "text-orange-600")
                          )} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-xl border-t border-border">
        <nav className="flex items-center justify-around h-16 px-1">
          {tabNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                  isActive
                    ? isLearning ? "text-primary" : "text-orange-600"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
