import { ArrowDown, ArrowUp, Eye, Search, SlidersHorizontal, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AuthorBooksData, AuthorBookRecord, AuthorBooksSummary } from "../types";

type AuthorBooksPageViewProps = {
  data: AuthorBooksData;
};

const columns = [
  { key: "name", label: "Book Name", className: "w-64 justify-start" },
  { key: "views", label: "Views", className: "flex-1 justify-center" },
  { key: "sales", label: "Sales", className: "flex-1 justify-center" },
  { key: "price", label: "Price", className: "flex-1 justify-center" },
  { key: "revenue", label: "Revenue", className: "flex-1 justify-center" },
  { key: "status", label: "Status", className: "flex-1 justify-center" },
  { key: "action", label: "Action", className: "flex-1 justify-center" },
] as const;

function StatusBadge({ book }: { book: AuthorBookRecord }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-28 items-center justify-center rounded-[999px] px-3 py-1 text-base font-medium leading-5",
        book.accent === "green"
          ? "bg-green-500/10 text-green-500"
          : "bg-amber-300/10 text-amber-400"
      )}
    >
      {book.status}
    </div>
  );
}

function SummaryCard({ item }: { item: AuthorBooksSummary }) {
  const showArrow = item.trend !== "neutral";
  const isDown = item.trend === "down";

  return (
    <div className="relative h-32 flex-1 overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="absolute left-4 top-4 inline-flex w-56 items-center gap-[3px]">
        <div className="flex-1 text-lg font-bold leading-6 text-zinc-800">{item.title}</div>
      </div>
      <div className="absolute left-4 top-[58px] inline-flex items-end gap-2">
        <div className="text-3xl font-bold leading-8 text-teal-950">{item.value}</div>
        <div className="flex items-center">
          {showArrow ? (
            <div className="flex size-4 items-center justify-center overflow-hidden">
              {isDown ? (
                <ArrowDown className="size-3 text-red-500" strokeWidth={2.4} />
              ) : (
                <ArrowUp className="size-3 text-green-500" strokeWidth={2.4} />
              )}
            </div>
          ) : null}
          <div
            className={cn(
              "text-sm font-medium leading-5",
              item.trend === "down" ? "text-red-500" : "text-green-500"
            )}
          >
            {item.change}
          </div>
        </div>
      </div>
      <div className="absolute left-4 top-[100px] text-sm text-[#6a717f]">{item.subtitle}</div>
    </div>
  );
}

export function AuthorBooksPageView({ data }: AuthorBooksPageViewProps) {
  return (
    <div className="space-y-6">
      <section className="inline-flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
        {data.summary.map((item) => (
          <SummaryCard key={item.id} item={item} />
        ))}
      </section>

      <Card className="rounded-lg bg-white py-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0">
        <CardContent className="flex flex-col gap-2.5 p-6">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-6 rounded-lg bg-lime-50 p-1">
                  {data.tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-md px-3 py-1.5",
                        tab.active ? "bg-white" : ""
                      )}
                    >
                      <span
                        className={cn(
                          "text-base font-medium leading-5",
                          tab.active ? "text-black" : "text-[#5f6774]"
                        )}
                      >
                        {tab.label}
                      </span>
                      {typeof tab.count === "number" ? (
                        <span className="text-sm font-bold text-green-400">({tab.count})</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-full items-center gap-1.5 rounded-lg bg-[#f8faf8] px-3 py-1.5 outline outline-1 outline-[#d4d8dd] sm:w-64">
                    <span className="flex-1 text-sm text-[#7a808b]">Search order report</span>
                    <Search className="size-4 text-[#4f5765]" strokeWidth={1.5} />
                  </div>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-sm bg-white outline outline-1 outline-[#d4d8dd]"
                    aria-label="Filter books"
                  >
                    <SlidersHorizontal className="size-5 text-[#4f5765]" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="inline-flex w-full min-w-[1068px] items-center gap-4 rounded-md bg-lime-50 p-2">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={cn("flex h-10 items-center p-2.5", column.className)}
                    >
                      <span className="text-base font-medium text-teal-950">{column.label}</span>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[1068px]">
                    {data.books.map((book) => (
                      <div
                        key={book.id}
                        className="inline-flex w-full items-center justify-between border-b border-[#cfd4da] px-2 py-3"
                      >
                        <div className="flex w-64 items-center gap-3 px-3">
                          <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-sm outline outline-1 outline-[#e6e6e6]">
                            <div
                              className={`size-7 rounded-[3px] bg-gradient-to-br ${book.coverTone}`}
                            />
                          </div>
                          <div className="flex-1 truncate text-base leading-5 text-black">
                            {book.title}
                          </div>
                        </div>

                        <div className="flex flex-1 justify-center p-2.5 text-base text-black">
                          {book.views}
                        </div>
                        <div className="flex flex-1 justify-center p-2.5 text-base text-black">
                          {book.sales}
                        </div>
                        <div className="flex flex-1 justify-center p-2.5 text-base text-black">
                          {book.price}
                        </div>
                        <div className="flex flex-1 justify-center p-2.5 text-base text-black">
                          {book.revenue}
                        </div>
                        <div className="flex flex-1 justify-center p-2.5">
                          <StatusBadge book={book} />
                        </div>
                        <div className="flex flex-1 justify-center p-2.5">
                          <div className="flex w-32 items-center justify-center gap-2.5">
                            <button
                              type="button"
                              aria-label={`Delete ${book.title}`}
                              className="inline-flex size-6 items-center justify-center text-[#c95a5a]"
                            >
                              <Trash2 className="size-5" strokeWidth={1.8} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Preview ${book.title}`}
                              className="inline-flex items-center justify-center rounded-full p-2 text-slate-700"
                            >
                              <Eye className="size-6" strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
