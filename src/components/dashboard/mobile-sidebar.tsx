"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DashboardNavItem } from "./dashboard-shell";
import { SidebarItem } from "./sidebar-item";

type MobileSidebarProps = {
  items: DashboardNavItem[];
  sectionLabel: string;
};

export function MobileSidebar({ items, sectionLabel }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        className="border-white/20 bg-white/8 text-white hover:bg-white/12 hover:text-white lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu />
      </Button>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-[#66756d] text-slate-100 transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-start justify-between px-5 py-5">
            <Logo inverted />
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X />
            </Button>
          </div>
          <p className="sr-only">{sectionLabel}</p>
          <nav className="flex flex-1 flex-col gap-6 px-4 py-6">
            {items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
