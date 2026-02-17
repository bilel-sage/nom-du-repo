"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: string; // tailwind color class
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, accent = "text-primary" }: StatCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-border/80">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-red-400"
            )}>
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50",
          "group-hover:scale-110 transition-transform"
        )}>
          <Icon className={cn("w-5 h-5", accent)} />
        </div>
      </div>
    </div>
  );
}
