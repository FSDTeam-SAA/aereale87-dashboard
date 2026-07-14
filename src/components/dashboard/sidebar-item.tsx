"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  LayoutDashboard,
  MessageSquare,
  PenSquare,
  Shield,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { DashboardNavItem } from "./dashboard-shell";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "book-open-text": BookOpenText,
  "pen-square": PenSquare,
  "message-square": MessageSquare,
  shield: Shield,
  users: Users,
  "bar-chart-3": BarChart3,
} as const;

type SidebarItemProps = {
  item: DashboardNavItem;
  onNavigate?: () => void;
};

export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = iconMap[item.icon];

  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400">
        <Icon className="size-4" />
        <span>{item.title}</span>
        <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em]">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
        isActive
          ? "bg-emerald-400/15 text-white shadow-[inset_0_0_0_1px_rgba(110,231,183,0.2)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="size-4" />
      <span>{item.title}</span>
    </Link>
  );
}
