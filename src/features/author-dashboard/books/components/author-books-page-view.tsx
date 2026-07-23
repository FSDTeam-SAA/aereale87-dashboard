"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AuthorBooksData, BackendBook, BookStatus } from "../types";

const statusStyles: Record<BookStatus, string> = {
  APPROVED: "bg-green-500/10 text-green-700",
  SUBMITTED: "bg-amber-300/20 text-amber-700",
  DRAFT: "bg-slate-200 text-slate-700",
  REJECTED: "bg-red-500/10 text-red-700",
};

export function AuthorBooksPageView({ data, accessToken }: { data: AuthorBooksData; accessToken: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookStatus | "ALL">("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const books = useMemo(() => data.books.filter((book) =>
    (status === "ALL" || book.status === status) && book.title.toLowerCase().includes(query.toLowerCase())), [data.books, query, status]);

  async function mutate(path: string, method: "PATCH" | "DELETE", success: string) {
    setPendingId(path.split("/")[2]);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setPendingId(null);
    const payload = await response.json();
    if (!response.ok) return toast.error(payload.message || "Action failed.");
    toast.success(success);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((item) => (
          <div key={item.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/10">
            <p className="text-lg font-bold text-zinc-800">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-teal-950">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
          </div>
        ))}
      </section>

      <Card className="rounded-lg bg-white py-0 shadow-sm ring-1 ring-black/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const).map((item) => (
                <button key={item} onClick={() => setStatus(item)} className={cn("rounded-md px-3 py-2 text-sm", status === item ? "bg-[#cfaf45] text-white" : "bg-lime-50 text-slate-700")}>{item === "ALL" ? "All Books" : item}</button>
              ))}
            </div>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" className="bg-transparent text-sm outline-none" />
              <Search className="size-4 text-slate-500" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-lime-50 text-sm text-teal-950"><tr><th className="p-4">Book</th><th className="p-4">Formats</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody>
                {books.map((book) => <BookRow key={book.id} book={book} pending={pendingId === book.id} onSubmit={() => mutate(`/books/${book.id}/submit`, "PATCH", "Book submitted for review.")} onDelete={() => mutate(`/books/${book.id}`, "DELETE", "Book deleted.")} />)}
              </tbody>
            </table>
            {!books.length ? <p className="py-12 text-center text-slate-500">No books match this view.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BookRow({ book, pending, onSubmit, onDelete }: { book: BackendBook; pending: boolean; onSubmit: () => void; onDelete: () => void }) {
  const editable = book.status === "DRAFT" || book.status === "REJECTED";
  const price = book.sellingPrice ?? book.formats[0]?.listPrice;
  const formats = [book.ebookAvailable && "eBook", book.audiobookAvailable && "Audio", book.printAvailable && "Print"].filter(Boolean).join(", ") || "—";
  return (
    <tr className="border-b border-slate-200">
      <td className="p-4"><div className="flex items-center gap-3">{book.bookCover ? <div role="img" aria-label={`${book.title} cover`} className="h-14 w-11 bg-cover bg-center" style={{ backgroundImage: `url(${book.bookCover})` }} /> : <div className="h-14 w-11 bg-lime-100" />}<div><p className="font-medium text-slate-900">{book.title}</p><p className="text-xs text-slate-500">Updated {new Date(book.updatedAt).toLocaleDateString()}</p></div></div></td>
      <td className="p-4 text-sm text-slate-600">{formats}</td>
      <td className="p-4 text-sm">{price == null ? "—" : `$${price.toFixed(2)}`}</td>
      <td className="p-4"><span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusStyles[book.status])}>{book.status}</span></td>
      <td className="p-4"><div className="flex justify-end gap-2">
        <Link href={`/author-dashboard/books/${book.id}`} aria-label={`View ${book.title}`} className="rounded p-2 text-slate-600 hover:bg-slate-100"><Eye className="size-4" /></Link>
        {editable ? <Link href={`/author-dashboard/upload-content?bookId=${book.id}`} aria-label={`Edit ${book.title}`} className="rounded p-2 text-blue-700 hover:bg-blue-50"><Edit3 className="size-4" /></Link> : null}
        {editable ? <button disabled={pending} onClick={onSubmit} aria-label={`Submit ${book.title}`} className="rounded p-2 text-amber-700 hover:bg-amber-50"><Send className="size-4" /></button> : null}
        <button disabled={pending} onClick={onDelete} aria-label={`Delete ${book.title}`} className="rounded p-2 text-red-700 hover:bg-red-50"><Trash2 className="size-4" /></button>
      </div></td>
    </tr>
  );
}
