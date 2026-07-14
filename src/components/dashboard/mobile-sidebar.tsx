"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

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
        className="lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu />
      </Button>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-slate-950 text-slate-100 transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
                {sectionLabel}
              </p>
            </div>
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
          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
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
