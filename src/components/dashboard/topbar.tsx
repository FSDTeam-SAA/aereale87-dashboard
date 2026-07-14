import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { UserNav } from "@/components/dashboard/user-nav";
import { Input } from "@/components/ui/input";

type TopbarProps = {
  sectionLabel: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  mobileSidebar: ReactNode;
};

export function Topbar({ sectionLabel, user, mobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {mobileSidebar}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                {sectionLabel}
              </p>
              <Breadcrumbs />
            </div>
          </div>
          <UserNav user={user} />
        </div>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search dashboard"
            placeholder="Search insights, tasks, or people"
            className="border-slate-200 bg-white pl-9"
          />
        </div>
      </div>
    </header>
  );
}
