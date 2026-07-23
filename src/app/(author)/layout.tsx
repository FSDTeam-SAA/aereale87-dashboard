import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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

export default async function AuthorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError" || session.user.role !== "AUTHOR") {
    redirect("/");
  }
  return (
    <DashboardShell
      items={authorNavItems}
      sectionLabel="Author dashboard"
      user={{
        name: session.user.name || session.user.email || "Author",
        email: session.user.email || "",
        role: session.user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
