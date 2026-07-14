import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const authorNavItems: DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/author-dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "My Posts",
    href: "/author-dashboard/posts",
    icon: "book-open-text",
    disabled: true,
  },
  {
    title: "Draft Queue",
    href: "/author-dashboard/drafts",
    icon: "pen-square",
    disabled: true,
  },
  {
    title: "Messages",
    href: "/author-dashboard/messages",
    icon: "message-square",
    disabled: true,
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
      sectionLabel="Author workspace"
      user={{
        name: "Maya Patel",
        email: "maya@example.com",
        role: "Senior Author",
      }}
    >
      {children}
    </DashboardShell>
  );
}
