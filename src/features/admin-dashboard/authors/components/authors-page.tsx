"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";

import { PageTitle } from "@/components/shared/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaginatedAuthors, AuthorStatus } from "../types";
import { AuthorActionDropdown } from "./author-action-dropdown";

export function AuthorsPage({ data, accessToken }: { data: PaginatedAuthors; accessToken: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AuthorStatus | "ALL">("ALL");
  const [w9Filter, setW9Filter] = useState<"ALL" | "SUBMITTED" | "APPROVED" | "MISSING">("ALL");

  const authors = useMemo(() => data.authors.filter((author) => {
    const name = `${author.profile?.firstName || ""} ${author.profile?.lastName || ""} ${author.email}`.toLowerCase();
    const matchesQuery = name.includes(query.toLowerCase());
    const matchesStatus = status === "ALL" || author.status === status;
    const matchesW9 =
      w9Filter === "ALL" ||
      (w9Filter === "SUBMITTED" && author.kyc?.kycStatus === "SUBMITTED") ||
      (w9Filter === "APPROVED" && author.kyc?.kycStatus === "APPROVED") ||
      (w9Filter === "MISSING" && (!author.kyc || author.kyc.kycStatus === "NOT_SUBMITTED"));
    return matchesQuery && matchesStatus && matchesW9;
  }), [data.authors, query, status, w9Filter]);

  const pendingKycCount = useMemo(
    () => data.authors.filter((a) => a.kyc?.kycStatus === "SUBMITTED").length,
    [data.authors]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          eyebrow="Author management"
          title="Authors"
          description={`${data.total} authors registered on the platform. Manage author access, approvals, and verify tax documents.`}
        />
        <Link
          href="/admin-dashboard/tax-forms"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[#cfaf45]/40 bg-[#cfaf45]/10 px-4 py-2 text-sm font-semibold text-[#8a6e19] transition hover:bg-[#cfaf45]/20"
        >
          <FileText className="size-4" />
          <span>W-9 & Tax Center</span>
          {pendingKycCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {pendingKycCount} pending
            </span>
          )}
        </Link>
      </div>

      <Card className="bg-white py-0 shadow-sm ring-1 ring-black/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(["ALL", "INACTIVE", "ACTIVE", "SUSPENDED"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    status === item
                      ? "bg-[#cfaf45] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {item === "INACTIVE" ? "PENDING" : item}
                </button>
              ))}
            </div>

            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 bg-white">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email..."
                className="bg-transparent text-sm outline-none w-56 sm:w-64"
              />
            </label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4 font-semibold">Author</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Books</th>
                  <th className="p-4 font-semibold">W-9 / Tax Status</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authors.map((author) => {
                  const name =
                    `${author.profile?.firstName || ""} ${author.profile?.lastName || ""}`.trim() ||
                    author.username;
                  return (
                    <tr key={author.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/admin-dashboard/authors/${author.id}`}
                          className="font-semibold text-slate-900 hover:text-[#a88922] transition-colors"
                        >
                          {name}
                        </Link>
                        {author.isFoundingAuthor && (
                          <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Founding
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">{author.email}</td>
                      <td className="p-4 font-medium text-slate-700">{author.bookCount}</td>
                      <td className="p-4">
                        {author.kyc?.kycStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {author.kyc.taxFormType || "W-9"} Verified
                          </span>
                        ) : author.kyc?.kycStatus === "SUBMITTED" ? (
                          <Link
                            href="/admin-dashboard/tax-forms"
                            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 transition"
                          >
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Review {author.kyc.taxFormType || "W-9"}
                          </Link>
                        ) : author.kyc?.kycStatus === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            Not Submitted
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold inline-block",
                            author.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : author.status === "INACTIVE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {author.status === "INACTIVE" ? "PENDING" : author.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <AuthorActionDropdown
                          id={author.id}
                          name={name}
                          status={author.status}
                          accessToken={accessToken}
                          taxFormFileUrl={author.kyc?.taxFormFileUrl}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!authors.length && (
              <p className="py-12 text-center text-slate-500">No authors match this filter.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
