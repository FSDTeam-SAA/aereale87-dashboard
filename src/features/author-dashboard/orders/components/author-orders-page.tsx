"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AuthorOrdersData, AuthorOrderRecord, AuthorOrderSummary } from "../types";

type AuthorOrdersPageProps = {
  data: AuthorOrdersData;
  accessToken: string;
};

function StatusBadge({ order }: { order: AuthorOrderRecord }) {
  const tone =
    order.payoutStatus === "PAID"
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : order.payoutStatus === "REQUESTED" || order.payoutStatus === "APPROVED"
        ? "border-sky-200 bg-sky-100 text-sky-800"
        : order.payoutStatus === "REJECTED"
          ? "border-red-200 bg-red-100 text-red-700"
          : "border-amber-200 bg-amber-100 text-amber-800";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-4",
        tone
      )}
    >
      {order.status}
    </div>
  );
}

function SummaryCard({ item }: { item: AuthorOrderSummary }) {
  return (
    <div className="flex-1 border border-stone-300 bg-white p-6">
      <div className="flex flex-col gap-2">
        <div className="text-sm leading-5 text-neutral-500">{item.label}</div>
        <div className="text-3xl font-bold leading-9 text-neutral-800">{item.value}</div>
      </div>
    </div>
  );
}

export function AuthorOrdersPage({ data, accessToken }: AuthorOrdersPageProps) {
  const router = useRouter();
  const requestPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payouts/author/${payoutId}/request`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to request payout.");
      }
      return payload;
    },
    onSuccess: () => {
      toast.success("Payout request submitted.");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-5 xl:flex-row">
        {data.summary.map((item) => (
          <SummaryCard key={item.id} item={item} />
        ))}
      </section>

      <Card className="rounded-none bg-white py-0 shadow-none ring-1 ring-stone-300">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex flex-col gap-4 border-b border-stone-200 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-h-9 flex-1 flex-wrap items-center gap-2">
              {data.tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "px-4 py-2 text-center text-sm font-medium leading-5",
                    tab.active ? "bg-orange-400 text-white" : "rounded-xl text-neutral-500"
                  )}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative inline-flex flex-col items-start">
                <div className="inline-flex w-64 items-start overflow-hidden border border-stone-300 bg-stone-100 pl-9 pr-4 py-3">
                  <div className="flex-1 text-sm text-gray-900/50">Live order search pending</div>
                </div>
                <Search className="absolute left-3 top-[12px] size-4 text-neutral-500" strokeWidth={1.6} />
              </div>
              <button
                type="button"
                aria-label="Filter orders"
                className="flex size-10 items-center justify-center border border-stone-300"
              >
                <SlidersHorizontal className="size-4 text-neutral-500" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-6">
              <div className="text-lg font-bold text-zinc-800">Author order payouts</div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="inline-flex w-full items-center bg-lime-50 border-b">
                  <div className="flex flex-1 items-center gap-1 px-5 py-2 text-xs font-medium uppercase text-neutral-800">
                    ORDER ID
                  </div>
                  <div className="flex flex-1 items-center gap-1 pl-12 pr-2 py-2 text-xs font-medium uppercase text-neutral-800">
                    CUSTOMER
                  </div>
                  <div className="flex flex-1 items-center gap-1 pl-5 pr-2 py-2 text-xs font-medium uppercase text-neutral-800">
                    ORDER STATUS
                  </div>
                  <div className="flex flex-1 items-center gap-1 px-5 py-2 text-xs font-medium uppercase text-neutral-800">
                    <span className="flex-1 text-center">AMOUNT</span>
                  </div>
                  <div className="flex flex-1 items-center gap-1 px-5 py-2 text-xs font-medium uppercase text-neutral-800">
                    <span className="flex-1 text-center">DATE</span>
                  </div>
                  <div className="flex flex-1 items-center gap-1 px-5 py-2 text-xs font-medium uppercase text-neutral-800">
                    <span className="flex-1 text-center">STATUS</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 px-5 py-4 text-xs font-medium uppercase text-neutral-800">
                    <span className="flex-1 text-right">PAYOUT ACTION</span>
                  </div>
                </div>

                {data.orders.map((order) => (
                  <div key={order.id} className="flex flex-col border-b border-stone-300">
                    <div className="inline-flex w-full items-center border-b">
                      <div className="flex flex-1 items-center gap-3 px-2 text-sm font-medium text-neutral-800 leading-5">
                        {order.orderId}
                      </div>
                      <div className="flex flex-1 items-center justify-between px-5 py-2 text-base text-zinc-800">
                        {order.customer}
                      </div>
                      <div className="flex flex-1 items-center justify-center gap-1 px-5 py-2 text-base text-zinc-800">
                        {order.products}
                      </div>
                      <div className="flex flex-1 items-center justify-between px-5 py-2 text-base text-neutral-800">
                        <div className="w-14">{order.amount}</div>
                      </div>
                      <div className="flex flex-1 items-center justify-center gap-2 px-5 py-2 text-base text-neutral-800">
                        <div className="w-28 text-center">{order.date}</div>
                      </div>
                      <div className="flex flex-1 items-center justify-center gap-1 px-5 py-2">
                        <StatusBadge order={order} />
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
                        {order.canRequestPayout ? (
                          <button
                            type="button"
                            onClick={() => requestPayoutMutation.mutate(order.payoutId)}
                            disabled={requestPayoutMutation.isPending}
                            className="rounded-md bg-[#cfaf45] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Request payout
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-neutral-500">
                            No action available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
