export type AdminOverviewStat = {
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: "traffic" | "tickets" | "authors" | "uptime";
};

export type AdminActivity = {
  id: string;
  label: string;
  meta: string;
};

export type AdminDashboardOverviewData = {
  stats: AdminOverviewStat[];
  approvals: {
    label: string;
    value: string;
  }[];
  activity: AdminActivity[];
};
