import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const adminNavItems: DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/admin-dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "Moderation",
    href: "/admin-dashboard/moderation",
    icon: "shield",
    disabled: true,
  },
  {
    title: "Authors",
    href: "/admin-dashboard/authors",
    icon: "users",
    disabled: true,
  },
  {
    title: "Reports",
    href: "/admin-dashboard/reports",
    icon: "bar-chart-3",
    disabled: true,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell
      items={adminNavItems}
      sectionLabel="Admin control room"
      user={{
        name: "Olivia Carter",
        email: "olivia@example.com",
        role: "Operations Admin",
      }}
    >
      {children}
    </DashboardShell>
  );
}
