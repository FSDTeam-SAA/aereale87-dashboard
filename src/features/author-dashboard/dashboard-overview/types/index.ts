export type AuthorOverviewStat = {
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: "views" | "drafts" | "comments" | "schedule";
};

export type AuthorTask = {
  id: string;
  title: string;
  due: string;
  status: "Drafting" | "In Review" | "Scheduled";
};

export type AuthorDashboardOverviewData = {
  stats: AuthorOverviewStat[];
  tasks: AuthorTask[];
  highlights: string[];
};
