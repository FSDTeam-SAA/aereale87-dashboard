"use client";

import { useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PaginatedNewsletterSubscribers } from "../types";

export function SubscribersPage({ data }: { data: PaginatedNewsletterSubscribers }) {
  const [query, setQuery] = useState("");
  const subscribers = useMemo(
    () =>
      data.subscribers.filter((subscriber) =>
        subscriber.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [data.subscribers, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a88922]">
            Newsletter
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Subscribers</h1>
          <p className="mt-1 text-slate-500">
            {data.total} readers are subscribed to community updates.
          </p>
        </div>
      </div>

      <Card className="rounded-lg bg-white py-0 shadow-sm ring-1 ring-black/10">
        <CardContent className="p-6">
          <label className="flex h-10 max-w-sm items-center gap-2 rounded-md border border-slate-300 px-3">
            <Search className="size-4 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subscribers"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-lime-50 text-teal-950">
                <tr>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Subscription Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-slate-200">
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
                        <Mail className="size-4 text-[#a88922]" />
                        {subscriber.email}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {subscriber.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!subscribers.length ? (
              <p className="py-12 text-center text-slate-500">
                No subscribers match this view.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
