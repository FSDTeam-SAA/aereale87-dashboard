"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

import { SidebarItem } from "./sidebar-item";
import type { DashboardNavItem } from "./dashboard-shell";

type SidebarProps = {
  items: DashboardNavItem[];
  sectionLabel: string;
  user: { name: string; email: string; role: string };
};

export function Sidebar({ items, sectionLabel, user }: SidebarProps) {
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-hidden bg-[#66756d] pb-6 lg:flex">
      <div className="absolute left-0 top-[71px] h-12 w-64 rounded-full bg-white/80 blur-[50px]" />
      <div className="flex flex-col items-center gap-12 py-6">
        <div className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="Wonder Emporium logo"
            width={150}
            height={90}
            className="h-24 w-36 object-contain"
            priority
          />
        </div>
        <div className="w-full pl-4">
          <p className="sr-only">{sectionLabel}</p>
          <nav className="flex flex-col gap-6">
            {items.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
      <div className="flex w-full flex-col gap-6 px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-[#24352f] text-sm font-semibold text-white ring-1 ring-white/10">
              {initials}
            </div>
            <div className="flex-1">
              <p className="line-clamp-1 text-base font-bold leading-4 text-[#fcfbf7]">
                {user.name}
              </p>
              <p className="mt-1 line-clamp-1 text-sm leading-4 text-[#d6d0bf]">
                {user.role}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="flex h-12 w-full items-center justify-center gap-1 rounded-md border border-[#ef4444] px-2 py-1.5 text-lg font-medium text-[#ef4444] transition-colors hover:bg-white/5"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
