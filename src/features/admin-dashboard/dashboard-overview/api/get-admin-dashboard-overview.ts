import type { AdminDashboardOverviewData } from "../types";

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewData> {
  return Promise.resolve({
    stats: [
      {
        title: "Platform sessions",
        value: "128K",
        change: "+8.2%",
        detail: "week over week",
        icon: "traffic",
      },
      {
        title: "Open support tickets",
        value: "14",
        change: "-3",
        detail: "since yesterday",
        icon: "tickets",
      },
      {
        title: "Active authors",
        value: "326",
        change: "+17",
        detail: "publishing this month",
        icon: "authors",
      },
      {
        title: "Service uptime",
        value: "99.94%",
        change: "+0.03%",
        detail: "rolling 30-day window",
        icon: "uptime",
      },
    ],
    approvals: [
      { label: "Pending article approvals", value: "11" },
      { label: "Flagged comments", value: "07" },
      { label: "Billing reviews", value: "03" },
    ],
    activity: [
      {
        id: "activity-1",
        label: "Ops team approved homepage takeover request",
        meta: "12 minutes ago",
      },
      {
        id: "activity-2",
        label: "Three new author invitations were accepted",
        meta: "47 minutes ago",
      },
      {
        id: "activity-3",
        label: "Spam moderation queue cleared for the morning cycle",
        meta: "1 hour ago",
      },
    ],
  });
}
