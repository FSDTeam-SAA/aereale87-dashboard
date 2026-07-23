import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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
    title: "Book Approvals",
    href: "/admin-dashboard/books",
    icon: "book-open-text",
  },
  {
    title: "Authors",
    href: "/admin-dashboard/authors",
    icon: "users",
  },
  {
    title: "Payouts",
    href: "/admin-dashboard/payouts",
    icon: "wallet",
  },
  {
    title: "Subscribers",
    href: "/admin-dashboard/subscribers",
    icon: "mail",
  },
  {
    title: "Reports",
    href: "/admin-dashboard/reports",
    icon: "bar-chart-3",
    disabled: true,
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError" || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/");
  }
  return (
    <DashboardShell
      items={adminNavItems}
      sectionLabel="Admin control room"
      user={{
        name: session.user.name || session.user.email || "Administrator",
        email: session.user.email || "",
        role: session.user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
