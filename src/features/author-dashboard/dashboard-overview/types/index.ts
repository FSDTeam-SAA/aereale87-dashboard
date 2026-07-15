export type AuthorOverviewStat = {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  detail: string;
  previousLabel: string;
  accent: string;
  icon: "sales" | "orders" | "pending";
};

export type AuthorWeeklyMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AuthorChartPoint = {
  day: string;
  value: number;
  tooltip: string;
};

export type AuthorProduct = {
  id: string;
  title: string;
  views: number;
  sales: number;
  status: "Published" | "Draft" | "Archived";
  revenue: string;
  coverTone: string;
};

export type AuthorDashboardOverviewData = {
  stats: AuthorOverviewStat[];
  weeklyMetrics: AuthorWeeklyMetric[];
  chartPoints: AuthorChartPoint[];
  products: AuthorProduct[];
};
