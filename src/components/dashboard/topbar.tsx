import type { ReactNode } from "react";
import { Bell } from "lucide-react";

import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { UserNav } from "@/components/dashboard/user-nav";

type TopbarProps = {
  user: {
    name: string;
    email: string;
    role: string;
  };
  mobileSidebar: ReactNode;
};

export function Topbar({ user, mobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 overflow-hidden bg-[#66756d] text-white">
      <div className="flex h-24 items-center justify-between px-4 md:px-6 lg:pl-7 lg:pr-11">
        <div className="flex min-w-0 items-center gap-3">
          {mobileSidebar}
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-tight text-[#f5f5f4]">
              Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="View notifications"
            className="inline-flex size-6 items-center justify-center text-white transition-colors hover:text-white/85"
          >
            <Bell className="size-4" />
          </button>
          <UserNav user={user} />
        </div>
      </div>
      <div className="sr-only">
        <Breadcrumbs />
      </div>
    </header>
  );
}
