"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Timer,
  Sunrise,
  Sunset,
  Menu,
  Zap,
  CalendarDays,
  Target,
  Lightbulb,
  Sun,
  Moon,
  CheckSquare,
  BookOpenText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// All items in the drawer
const ALL_NAV = [
  { href: "/dashboard",     label: "Accueil",       icon: Home },
  { href: "/rituels/matin", label: "Rituels Matin",  icon: Sun },
  { href: "/rituels/soir",  label: "Rituels Soir",   icon: Moon },
  { href: "/habits",        label: "Habitudes",      icon: CalendarCheck },
  { href: "/todo",          label: "To Do",          icon: CheckSquare },
  { href: "/agenda",        label: "Agenda",         icon: CalendarDays },
  { href: "/objectifs",     label: "Objectifs",      icon: Target },
  { href: "/idees",         label: "Idées Business", icon: Lightbulb },
  { href: "/do-it-now",     label: "Do It Now",      icon: Timer },
  { href: "/focus/matin",   label: "Focus Matin",    icon: Sunrise },
  { href: "/focus/soir",    label: "Focus Soir",     icon: Sunset },
  { href: "/bilearning",    label: "Bilearning",     icon: BookOpenText },
];

// Bottom tab bar — 5 most used
const TAB_NAV = [
  { href: "/dashboard",     label: "Accueil",    icon: Home },
  { href: "/rituels/matin", label: "Rituels",    icon: Sun },
  { href: "/habits",        label: "Habitudes",  icon: CalendarCheck },
  { href: "/agenda",        label: "Agenda",     icon: CalendarDays },
  { href: "/objectifs",     label: "Objectifs",  icon: Target },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">Biproductive</span>
            </div>
          </div>
          <nav className="p-2.5 space-y-0.5 overflow-y-auto">
            {ALL_NAV.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-xl border-t border-border">
        <nav className="flex items-center justify-around h-16 px-1">
          {TAB_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
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
