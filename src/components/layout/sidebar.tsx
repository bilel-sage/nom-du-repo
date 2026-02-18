"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Timer,
  Sunrise,
  Sunset,
  ChevronLeft,
  Zap,
  CalendarDays,
  Target,
  Lightbulb,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const NAV_GROUPS = [
  {
    label: "Personnel",
    items: [
      { href: "/dashboard", label: "Accueil", icon: Home },
      { href: "/rituels/matin", label: "Rituels Matin", icon: Sun },
      { href: "/rituels/soir", label: "Rituels Soir", icon: Moon },
    ],
  },
  {
    label: "Organisation",
    items: [
      { href: "/habits", label: "Habitudes", icon: CalendarCheck },
      { href: "/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/objectifs", label: "Objectifs", icon: Target },
      { href: "/idees", label: "Idées Business", icon: Lightbulb },
    ],
  },
  {
    label: "Focus",
    items: [
      { href: "/deepwork", label: "Deepwork", icon: Timer },
      { href: "/focus/matin", label: "Focus Matin", icon: Sunrise },
      { href: "/focus/soir", label: "Focus Soir", icon: Sunset },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 z-40",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <span className="text-base font-bold tracking-tight text-sidebar-foreground truncate">
              Biproductive
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium",
                    "transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return <div key={item.href}>{linkContent}</div>;
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2.5 border-t border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-sidebar-foreground",
            !isCollapsed && "justify-start"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
          {!isCollapsed && <span className="ml-2 text-xs">Réduire</span>}
        </Button>
      </div>
    </aside>
  );
}
