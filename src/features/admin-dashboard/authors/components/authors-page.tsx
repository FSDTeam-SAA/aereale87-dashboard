"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PageTitle } from "@/components/shared/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaginatedAuthors, AuthorStatus } from "../types";
import { AuthorStatusAction } from "./author-status-action";

export function AuthorsPage({ data, accessToken }: { data: PaginatedAuthors; accessToken: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AuthorStatus | "ALL">("ALL");
  const authors = useMemo(() => data.authors.filter((author) => {
    const name = `${author.profile?.firstName || ""} ${author.profile?.lastName || ""} ${author.email}`.toLowerCase();
    return (status === "ALL" || author.status === status) && name.includes(query.toLowerCase());
  }), [data.authors, query, status]);

  return <div className="space-y-6">
    <PageTitle eyebrow="Author management" title="Authors" description={`${data.total} authors are registered on the platform. Review pending applications and inspect author profiles.`} />
    <Card className="bg-white py-0"><CardContent className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">{(["ALL", "INACTIVE", "ACTIVE", "SUSPENDED"] as const).map((item) => <button key={item} onClick={() => setStatus(item)} className={cn("rounded-md px-3 py-2 text-sm", status === item ? "bg-[#cfaf45] text-white" : "bg-slate-100 text-slate-700")}>{item === "INACTIVE" ? "PENDING" : item}</button>)}</div>
        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search authors" className="bg-transparent text-sm outline-none" /><Search className="size-4 text-slate-500" /></label>
      </div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-lime-50 text-teal-950"><tr><th className="p-4">Author</th><th className="p-4">Email</th><th className="p-4">Books</th><th className="p-4">Verified</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>
        {authors.map((author) => { const name = `${author.profile?.firstName || ""} ${author.profile?.lastName || ""}`.trim() || author.username; return <tr key={author.id} className="border-b border-slate-200"><td className="p-4"><Link href={`/admin-dashboard/authors/${author.id}`} className="font-semibold text-slate-900 hover:text-[#a88922]">{name}</Link>{author.isFoundingAuthor ? <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Founding</span> : null}</td><td className="p-4 text-slate-600">{author.email}</td><td className="p-4">{author.bookCount}</td><td className="p-4">{author.verified ? "Yes" : "No"}</td><td className="p-4"><span className={cn("rounded-full px-3 py-1 text-xs font-semibold", author.status === "ACTIVE" ? "bg-green-100 text-green-700" : author.status === "INACTIVE" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700")}>{author.status === "INACTIVE" ? "PENDING" : author.status}</span></td><td className="p-4 text-right"><AuthorStatusAction id={author.id} status={author.status} accessToken={accessToken} /></td></tr>; })}
      </tbody></table>{!authors.length ? <p className="py-12 text-center text-slate-500">No authors match this view.</p> : null}</div>
    </CardContent></Card>
  </div>;
}
