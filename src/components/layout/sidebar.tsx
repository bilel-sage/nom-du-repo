"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  ListChecks,
  CalendarCheck,
  Timer,
  Crosshair,
  User,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Cockpit", icon: LayoutDashboard },
  { href: "/quests", label: "Quêtes", icon: Swords },
  { href: "/habits", label: "Habitudes", icon: CalendarCheck },
  { href: "/deepwork", label: "Deepwork", icon: Timer },
  { href: "/focus", label: "Focus Zone", icon: Crosshair },
  { href: "/profile", label: "Profil RPG", icon: User },
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
        isCollapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground truncate">
              Eclipse
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon
                className={cn("w-5 h-5 shrink-0", isActive && "text-primary")}
              />
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
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-sidebar-border">
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
