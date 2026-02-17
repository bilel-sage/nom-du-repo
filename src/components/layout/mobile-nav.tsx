"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  CalendarCheck,
  Timer,
  Crosshair,
  Menu,
  X,
  Zap,
  User,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Cockpit", icon: LayoutDashboard },
  { href: "/quests", label: "Quêtes", icon: Swords },
  { href: "/habits", label: "Habitudes", icon: CalendarCheck },
  { href: "/deepwork", label: "Deepwork", icon: Timer },
  { href: "/focus", label: "Focus", icon: Crosshair },
];

const fullNavItems = [
  ...navItems,
  { href: "/profile", label: "Profil RPG", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <>
      {/* Hamburger menu for slide-out drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Eclipse
              </span>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {fullNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
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
                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Bottom tab bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-xl border-t border-border">
        <nav className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
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
