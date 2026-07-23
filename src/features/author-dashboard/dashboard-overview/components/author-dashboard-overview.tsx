"use client";

import { Calculator, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AuthorChartPoint, AuthorDashboardOverviewData } from "../types";

type AuthorDashboardOverviewProps = {
  data: AuthorDashboardOverviewData;
};

function buildChartPath(points: AuthorChartPoint[]) {
  const width = 100;
  const height = 100;
  const stepX = width / (points.length - 1 || 1);
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const range = maxValue - minValue || 1;

  const coordinates = points.map((point, index) => {
    const x = index * stepX;
    const y = height - ((point.value - minValue) / range) * 65 - 12;

    return { x, y };
  });

  const line = coordinates
    .map((point, index, allPoints) => {
      if (index === 0) {
        return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      }

      const previousPoint = allPoints[index - 1];
      const midpointX = ((previousPoint.x + point.x) / 2).toFixed(2);

      return `C ${midpointX} ${previousPoint.y.toFixed(2)} ${midpointX} ${point.y.toFixed(2)} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${line} L 100 92 L 0 92 Z`;

  return { coordinates, line, area };
}

export function AuthorDashboardOverview({ data }: AuthorDashboardOverviewProps) {
  const chart = buildChartPath(data.chartPoints);

  return (
    <div className="space-y-3">
      <section className="grid gap-4 xl:grid-cols-3">
        {data.stats.map((stat) => {
          const changeClassName =
            stat.accent === "rose"
              ? "text-[#f87272]"
              : "text-[#21c45d]";

          return (
            <Card
              key={stat.title}
              className="rounded-none border border-[#e8e0cc] bg-white py-0 shadow-none ring-0"
            >
              <CardContent className="p-0">
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[18px] font-bold text-[#23272e]">{stat.title}</p>
                      <p className="mt-1 text-[14px] text-[#6a717f]">{stat.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`More options for ${stat.title}`}
                      className="text-[#7d8491] transition-colors hover:text-[#364034]"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>

                  {stat.icon === "pending" ? (
                    <div className="grid grid-cols-2 gap-6 pt-1">
                      <div>
                        <p className="text-[14px] text-black">Pending</p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="text-[32px] font-bold tracking-tight text-[#023337]">
                            {stat.value}
                          </p>
                          <span className="pb-1 text-[16px] text-[#4ea674]">{stat.detail}</span>
                        </div>
                      </div>
                      <div className="border-l border-[#d5d2cb] pl-5">
                        <p className="text-[14px] text-black">Canceled</p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="text-[32px] font-bold tracking-tight text-[#ef4343]">94</p>
                          <span className="pb-1 text-[14px] text-[#f87272]">{stat.change}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-3">
                        <p className="text-[32px] font-bold tracking-tight text-[#023337]">
                          {stat.value}
                        </p>
                        <span className="pb-1 text-[16px] text-[#202020]">{stat.detail}</span>
                        <span className={`mb-1 text-[14px] font-medium ${changeClassName}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] text-[#6a717f]">{stat.previousLabel}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-[#6467f2] px-6 text-[16px] font-normal text-[#6467f2] hover:bg-[#f2f0ff]"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section>
        <Card className="rounded-lg border border-[#e7e1d5] bg-white py-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0">
          <CardContent className="relative h-[460px] overflow-hidden p-0">
            <div className="absolute left-5 top-5 inline-flex w-[calc(100%-40px)] items-center gap-2">
              <CardTitle className="flex-1 text-lg font-bold leading-6 text-[#23272e]">
                Report for this week
              </CardTitle>
              <div className="flex items-start gap-1 rounded-xl bg-lime-50 p-1">
                <div className="flex items-center gap-1 rounded-lg bg-stone-50 px-3 py-2">
                  <span className="text-xs font-medium leading-4 text-neutral-800">
                    This week
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-lg px-3 py-2">
                  <span className="text-xs leading-4 text-neutral-800">Last week</span>
                </div>
              </div>
            </div>

            <div className="absolute left-6 top-[78px] inline-flex w-[calc(100%-48px)] items-start gap-5">
              {data.weeklyMetrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`flex-1 px-2 py-3.5 ${index === 0 ? "border-b-2 border-[#fb923c] bg-gradient-to-b from-[rgba(251,146,60,0)] to-[rgba(251,146,60,0.05)]" : "border-b border-violet-100"}`}
                >
                  <p className="text-2xl font-bold leading-5 text-zinc-800">{metric.value}</p>
                  <p className="mt-2 text-xs font-medium leading-4 text-neutral-400">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="absolute left-9 top-[203px] inline-flex h-52 flex-col items-end justify-between text-sm leading-5 text-[#023337]/50">
              <span>50k</span>
              <span>40k</span>
              <span>30k</span>
              <span>20k</span>
              <span>10k</span>
              <span>0k</span>
            </div>

            <div className="absolute left-[72px] top-[196px] h-52 w-[calc(100%-104px)] overflow-hidden border-l border-r border-black/20">
              <div className="absolute inset-x-0 top-[69px] bottom-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="author-chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chart.area} fill="url(#author-chart-fill)" />
                  <path
                    d={chart.line}
                    fill="none"
                    stroke="#4caf69"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="absolute left-[29%] top-[2px] h-14 w-24">
                <div className="absolute left-1/2 top-[10px] inline-flex -translate-x-1/2 flex-col items-center justify-center">
                  <div className="text-xs font-medium text-teal-950">Thursday</div>
                  <div className="text-xs font-medium text-teal-950">14k</div>
                </div>
              </div>

              <div className="absolute left-[32.9%] top-[59px] size-2.5 rounded-full bg-green-200">
                <div className="absolute left-[2px] top-[2px] size-1.5 rounded-full bg-white" />
              </div>

              <div className="absolute left-[33.35%] top-[69px] h-36 w-0 border-l-2 border-[#d9f5ce]" />
            </div>

            <div className="absolute left-[72px] top-[418px] inline-flex w-[calc(100%-144px)] items-start justify-between text-xs text-teal-950/50">
              {data.chartPoints.map((point) => (
                <span
                  key={point.day}
                  className={point.day === "Wed" ? "font-bold text-teal-950" : undefined}
                >
                  {point.day}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-lg border border-[#e7e1d5] bg-white py-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0">
          <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4">
            <CardTitle className="text-[18px] font-bold text-[#23272e]">Best selling product</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-none border-[#d4ad2e] px-5 text-[13px] font-semibold text-[#cb9f10] hover:bg-[#fff6dc]"
            >
              VIEW ALL
            </Button>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#f8f2e5] text-[11px] uppercase tracking-[0.04em] text-[#3d463d]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Product</th>
                    <th className="px-5 py-4 font-medium">Views</th>
                    <th className="px-5 py-4 font-medium">Sales</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product.id} className="border-t border-transparent text-[15px] text-[#23272e]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-[46px] w-[30px] shrink-0 rounded-[2px] bg-gradient-to-br ${product.coverTone}`} />
                          <span className="font-bold tracking-[-0.15px] text-[#023337]">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">{product.views}</td>
                      <td className="px-5 py-3">{product.sales}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2 text-[15px] text-[#21c45d]">
                          <span className="size-1.5 rounded-full bg-current" />
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#023337]">
                        {product.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>



      <div className="pointer-events-none fixed bottom-5 right-5 z-20 hidden lg:block">
        <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full border border-[#e4dfd5] bg-[#fcfbf7] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#dbe8f6] text-[12px] font-bold text-[#325f91]">
            CS
          </div>
          <span className="mt-1 rounded-full bg-[#d9f1ff] px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-[#427ab6]">
            SUPPORT
          </span>
        </div>
      </div>
    </div>
  );
}

