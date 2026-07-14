import { Logo } from "@/components/shared/logo";

import { SidebarItem } from "./sidebar-item";
import type { DashboardNavItem } from "./dashboard-shell";

type SidebarProps = {
  items: DashboardNavItem[];
  sectionLabel: string;
};

export function Sidebar({ items, sectionLabel }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200/70 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <Logo inverted />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div className="px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
            {sectionLabel}
          </p>
        </div>
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
