import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
};

export function StatsCard({ title, value, change, detail, icon: Icon }: StatsCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white/90 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.4)]">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                <ArrowUpRight className="size-3.5" />
                {change}
              </span>
              <span className="text-slate-500">{detail}</span>
            </div>
          </div>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
