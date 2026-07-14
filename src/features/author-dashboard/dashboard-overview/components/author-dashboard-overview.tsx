import { CalendarClock, FilePenLine, MessageCircleMore, Newspaper } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { PageTitle } from "@/components/shared/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { AuthorDashboardOverviewData, AuthorOverviewStat } from "../types";

const iconMap = {
  views: Newspaper,
  drafts: FilePenLine,
  comments: MessageCircleMore,
  schedule: CalendarClock,
} satisfies Record<AuthorOverviewStat["icon"], typeof Newspaper>;

type AuthorDashboardOverviewProps = {
  data: AuthorDashboardOverviewData;
};

export function AuthorDashboardOverview({ data }: AuthorDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Overview"
        title="Author dashboard overview"
        description="A focused snapshot of readership, publishing momentum, and the writing work that needs attention next."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            detail={stat.detail}
            icon={iconMap[stat.icon]}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="border-slate-200/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-slate-950">Current writing queue</CardTitle>
            <CardDescription>
              The next pieces moving through your editorial pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.due}</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {task.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-slate-950 text-slate-100">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
            <CardDescription className="text-slate-400">
              Signals worth noticing before your next publishing block.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200"
              >
                {highlight}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
