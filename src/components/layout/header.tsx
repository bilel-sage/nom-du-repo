"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { ModeToggle } from "./mode-toggle";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

function getInitials(user: { email?: string; user_metadata?: { username?: string } } | null): string {
  if (!user) return "??";
  const username = user.user_metadata?.username;
  if (username) return username.slice(0, 2).toUpperCase();
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "EC";
}

export function Header() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="shrink-0 z-10 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3">
        <MobileNav />
        <ModeToggle />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {user && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
