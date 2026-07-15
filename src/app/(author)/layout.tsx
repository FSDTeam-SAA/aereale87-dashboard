import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const authorNavItems: DashboardNavItem[] = [
  {
    title: "Dashboard Overview",
    href: "/author-dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "My Books",
    href: "/author-dashboard/books",
    icon: "book-open-text",
  },
  {
    title: "Upload Content",
    href: "/author-dashboard/upload-content",
    icon: "upload",
  },
  {
    title: "Payout Preferences",
    href: "/author-dashboard/payout-preferences",
    icon: "wallet",
  },
  {
    title: "Orders",
    href: "/author-dashboard/orders",
    icon: "shopping-cart",
  },
  {
    title: "Settings",
    href: "/author-dashboard/settings",
    icon: "settings",
  },
];

export default function AuthorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell
      items={authorNavItems}
      sectionLabel="Author dashboard"
      user={{
        name: "Demo Name",
        email: "demo@authorhub.com",
        role: "Super Admin",
      }}
    >
      {children}
    </DashboardShell>
  );
}
