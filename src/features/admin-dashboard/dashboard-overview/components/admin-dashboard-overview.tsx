import { Activity, LifeBuoy, ServerCog, Users2 } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { PageTitle } from "@/components/shared/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { AdminDashboardOverviewData, AdminOverviewStat } from "../types";

const iconMap = {
  traffic: Activity,
  tickets: LifeBuoy,
  authors: Users2,
  uptime: ServerCog,
} satisfies Record<AdminOverviewStat["icon"], typeof Activity>;

type AdminDashboardOverviewProps = {
  data: AdminDashboardOverviewData;
};

export function AdminDashboardOverview({ data }: AdminDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Overview"
        title="Admin dashboard overview"
        description="A compact operations snapshot covering platform activity, review queues, and the moments that may need intervention."
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

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <Card className="border-slate-200/70 bg-slate-950 text-slate-100">
          <CardHeader>
            <CardTitle>Approval queues</CardTitle>
            <CardDescription className="text-slate-400">
              Operational work waiting on an admin decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.approvals.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <span className="text-sm text-slate-200">{item.label}</span>
                <span className="text-2xl font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-slate-950">Recent operational activity</CardTitle>
            <CardDescription>
              A quick read on actions completed across the platform today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activity.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
              >
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
