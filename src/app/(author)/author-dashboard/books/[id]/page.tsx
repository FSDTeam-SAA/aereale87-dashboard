import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getBook } from "@/features/author-dashboard/books/api/get-book";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthorBookDetailActions } from "@/features/author-dashboard/books/components/author-book-detail-actions";

export default async function AuthorBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const { id } = await params;
  let book;
  try {
    book = await getBook(id, session.accessToken);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/author-dashboard/books" className="text-sm font-medium text-[#997b1e] hover:underline">
        ← Back to books
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold">{book.status}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{book.title}</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Last updated {new Date(book.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <AuthorBookDetailActions book={book} userName={session.user.name} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-white shadow-sm ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Listing details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Detail label="Author / Pen Name" value={book.authorName || session.user.name || "—"} />
            <Detail label="Category" value={book.category || "—"} />
            <Detail label="Language" value={book.language || "—"} />
            <Detail
              label="Formats"
              value={book.formats.map((format) => format.formatType).join(", ") || "—"}
            />
            <Detail label="Status" value={book.status} />
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-6 text-slate-700 whitespace-pre-line">
              {book.description || "No description provided."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-medium text-slate-900">{value}</span></div>; }
