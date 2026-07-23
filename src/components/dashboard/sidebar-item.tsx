"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  PenSquare,
  Shield,
  Settings,
  ShoppingCart,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { DashboardNavItem } from "./dashboard-shell";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "book-open-text": BookOpenText,
  "pen-square": PenSquare,
  "message-square": MessageSquare,
  mail: Mail,
  shield: Shield,
  users: Users,
  "bar-chart-3": BarChart3,
  upload: Upload,
  wallet: Wallet,
  "shopping-cart": ShoppingCart,
  settings: Settings,
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
      <div className="flex h-12 items-center gap-2 px-6 py-2 text-base text-[#fcfbf7]">
        <Icon className="size-5 shrink-0" />
        <span className="truncate">{item.title}</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-12 items-center gap-2 px-6 py-3 text-base transition-all",
        isActive
          ? "rounded-l-[99px] rounded-r-none bg-[#cfaf45] font-bold text-[#f9fafb]"
          : "text-[#fcfbf7] hover:bg-white/8 hover:text-white"
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
