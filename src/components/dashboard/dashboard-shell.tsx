import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: "layout-dashboard" | "book-open-text" | "pen-square" | "message-square" | "shield" | "users" | "bar-chart-3";
  disabled?: boolean;
};

type DashboardShellProps = {
  children: React.ReactNode;
  items: DashboardNavItem[];
  sectionLabel: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function DashboardShell({
  children,
  items,
  sectionLabel,
  user,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fbfa_0%,_#eff5f2_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <Sidebar items={items} sectionLabel={sectionLabel} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            sectionLabel={sectionLabel}
            user={user}
            mobileSidebar={<MobileSidebar items={items} sectionLabel={sectionLabel} />}
          />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
