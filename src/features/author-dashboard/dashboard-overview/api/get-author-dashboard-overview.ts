import type { AuthorDashboardOverviewData } from "../types";

export async function getAuthorDashboardOverview(): Promise<AuthorDashboardOverviewData> {
  return Promise.resolve({
    stats: [
      {
        title: "Monthly readers",
        value: "84.2K",
        change: "+12.4%",
        detail: "vs last month",
        icon: "views",
      },
      {
        title: "Active drafts",
        value: "08",
        change: "+2",
        detail: "ready for refinement",
        icon: "drafts",
      },
      {
        title: "Unread comments",
        value: "37",
        change: "+9",
        detail: "awaiting response",
        icon: "comments",
      },
      {
        title: "Scheduled posts",
        value: "05",
        change: "+1",
        detail: "going live this week",
        icon: "schedule",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Finalize July editorial recap",
        due: "Today, 4:00 PM",
        status: "In Review",
      },
      {
        id: "task-2",
        title: "Outline creator spotlight interview",
        due: "Tomorrow, 11:30 AM",
        status: "Drafting",
      },
      {
        id: "task-3",
        title: "Confirm assets for homepage feature",
        due: "Friday, 9:00 AM",
        status: "Scheduled",
      },
    ],
    highlights: [
      "Your long-form feature on creator retention is outperforming the category average by 18%.",
      "Two recently published articles are trending in newsletter click-throughs.",
      "Editors left feedback on the Q3 campaign brief and would like revisions before Thursday.",
    ],
  });
}
