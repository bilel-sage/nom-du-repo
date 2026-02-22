"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Timer,
  Sunrise,
  Sunset,
  ChevronLeft,
  ChevronDown,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  isCollapsed: boolean;
  isLearning: boolean;
  pathname: string;
}

function NavGroup({ label, icon: Icon, items, isCollapsed, isLearning, pathname }: NavGroupProps) {
  const [open, setOpen] = useState(true);

  const renderLink = (item: NavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const ItemIcon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium",
          "transition-all duration-150",
          isActive
            ? isLearning
              ? "bg-primary/10 text-primary"
              : "bg-orange-500/10 text-orange-600"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <ItemIcon className={cn(
          "w-4 h-4 shrink-0",
          isActive && (isLearning ? "text-primary" : "text-orange-600")
        )} />
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
  };

  // Sidebar réduite — pas de toggle, juste les icônes
  if (isCollapsed) {
    return <div className="space-y-0.5">{items.map(renderLink)}</div>;
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1 rounded-lg
                   text-muted-foreground hover:text-sidebar-foreground
                   hover:bg-sidebar-accent transition-colors"
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", !open && "-rotate-90")} />
      </button>

      <div className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-in-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="ml-3.5 pl-2 border-l border-sidebar-border/60 space-y-0.5 py-0.5">
            {items.map(renderLink)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { mode } = useModeStore();

  const isLearning = mode === "learning";
  const navGroups = isLearning ? LEARNING_GROUPS : BUSINESS_GROUPS;

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
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-white shrink-0",
            isLearning ? "bg-blue-600" : "bg-orange-600"
          )}>
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
      <nav className="flex-1 py-3 px-2.5 space-y-3 overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroup
            key={group.label}
            label={group.label}
            icon={group.icon}
            items={group.items}
            isCollapsed={isCollapsed}
            isLearning={isLearning}
            pathname={pathname}
          />
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
