import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
  AuthorPayoutPreferencesData,
  AuthorPayoutRecord,
} from "../types";

type AuthorPayoutPreferencesPageProps = {
  data: AuthorPayoutPreferencesData;
};

function StatusPill({ record }: { record: AuthorPayoutRecord }) {
  const isCompleted = record.status === "Completed";

  return (
    <div
      className={cn(
        "inline-flex h-10 w-28 items-center justify-center rounded-[999px] px-3 py-1 text-base font-medium leading-5",
        isCompleted ? "bg-green-500/10 text-green-500" : "bg-amber-300/10 text-amber-300"
      )}
    >
      {record.status}
    </div>
  );
}

export function AuthorPayoutPreferencesPage({
  data,
}: AuthorPayoutPreferencesPageProps) {
  return (
    <Card className="overflow-hidden rounded-none bg-white py-0 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.10)] ring-1 ring-stone-300">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-stone-200 p-6">
          <div className="text-lg font-bold capitalize leading-7 text-neutral-800">
            Recent Payouts
          </div>
          <button
            type="button"
            className="flex items-center justify-center bg-orange-400 px-6 py-3 text-base font-bold text-white"
          >
            Edit Payout Method
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1068px]">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 rounded-md bg-lime-50 p-2">
                <div className="flex h-10 w-36 items-center p-2.5 text-base font-medium text-teal-950">
                  DATE
                </div>
                <div className="flex h-10 w-52 items-center justify-center p-2.5 text-base font-medium text-teal-950">
                  TRANSACTION ID
                </div>
                <div className="flex h-10 flex-1 items-center justify-center p-2.5 text-base font-medium text-teal-950">
                  METHOD
                </div>
                <div className="flex h-10 flex-1 items-center justify-center p-2.5 text-base font-medium text-teal-950">
                  STATUS
                </div>
                <div className="flex h-10 flex-1 items-center justify-between p-2.5 text-base font-medium text-teal-950">
                  AMOUNT
                </div>
              </div>

              {data.payouts.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b border-[#d4d4d4] p-3"
                >
                  <div className="flex w-36 items-center gap-3 text-base leading-5 text-black">
                    {record.date}
                  </div>
                  <div className="flex w-60 items-center justify-center p-2.5 text-base text-black">
                    {record.transactionId}
                  </div>
                  <div className="flex w-64 items-center justify-center p-2.5 text-base text-black">
                    {record.method}
                  </div>
                  <div className="flex flex-1 items-center justify-center p-2.5">
                    <StatusPill record={record} />
                  </div>
                  <div className="flex w-64 items-center justify-center p-2.5 text-base text-black">
                    {record.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-200 p-4">
          <div className="text-sm leading-5 text-neutral-500">{data.entriesLabel}</div>
          <div className="flex items-start gap-1">
            <button
              type="button"
              className="rounded-sm border border-stone-200 px-3 py-1 text-sm text-neutral-500"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-sm border border-stone-200 bg-green-900 px-3 py-1 text-sm text-white"
            >
              1
            </button>
            <button
              type="button"
              className="rounded-sm border border-stone-200 px-3 py-1 text-sm text-neutral-500"
            >
              2
            </button>
            <button
              type="button"
              className="rounded-sm border border-stone-200 px-3 py-1 text-sm text-neutral-500"
            >
              3
            </button>
            <button
              type="button"
              className="rounded-sm border border-stone-200 px-3 py-1 text-sm text-neutral-500"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
