"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Search, Eye, ExternalLink, Download, FileText, FileAudio, ImageIcon, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { approveBook } from "../api/approve-book";
import type { AdminPendingBooksData, AdminPendingBook } from "../types";
import { getBookFileUrl, type BookFileType } from "../types";

interface AdminBooksApprovalPageProps {
  pendingData?: AdminPendingBooksData;
  catalogData?: AdminPendingBooksData;
  data?: AdminPendingBooksData;
  accessToken: string;
}

export function AdminBooksApprovalPage({
  pendingData,
  catalogData,
  data,
  accessToken,
}: AdminBooksApprovalPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CATALOG" | "PENDING">(
    catalogData && catalogData.books.length > 0 ? "CATALOG" : "PENDING"
  );
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [detailBook, setDetailBook] = useState<AdminPendingBook | null>(null);
  const [bookToDelete, setBookToDelete] = useState<AdminPendingBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const effectivePending = pendingData?.books || data?.books || [];
  const effectiveCatalog = catalogData?.books || effectivePending;

  const displayedBooks = useMemo(() => {
    const sourceList = activeTab === "PENDING" ? effectivePending : effectiveCatalog;
    return sourceList.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      (book.author?.username || "").toLowerCase().includes(query.toLowerCase()) ||
      (book.category || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [activeTab, effectivePending, effectiveCatalog, query]);

  async function handleApprove(bookId: string, status: "APPROVED" | "REJECTED") {
    setPendingId(bookId);
    try {
      await approveBook(bookId, status, accessToken);
      toast.success(`Book ${status === "APPROVED" ? "approved" : "rejected"} successfully.`);
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : null) || "Failed to process book.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1"}/books/${bookToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to remove book");
      }

      toast.success(`"${bookToDelete.title}" removed successfully.`);
      if (detailBook?.id === bookToDelete.id) {
        setDetailBook(null);
      }
      setBookToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting book.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Books & Catalog</h1>
          <p className="mt-1 text-slate-500">
            Manage your digital library, upload e-books and audiobooks directly to the app, and review author submissions.
          </p>
        </div>

        <Link
          href="/admin-dashboard/books/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-[#24352f] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#192621] transition"
        >
          <FileText className="size-4 text-[#cfaf45]" />
          <span>+ Upload Book to App</span>
        </Link>
      </div>

      <Card className="rounded-lg bg-white py-0 shadow-sm ring-1 ring-black/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("CATALOG")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "CATALOG"
                    ? "bg-[#cfaf45] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Book Catalog ({effectiveCatalog.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("PENDING")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "PENDING"
                    ? "bg-[#cfaf45] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Pending Approvals</span>
                {effectivePending.length > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {effectivePending.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3">
              <Search className="size-4 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, author, or category..."
                className="bg-transparent text-sm outline-none w-64"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4">Book Details</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Formats & Pricing</th>
                  <th className="p-4">Status in App</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBooks.map((book) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    isPending={pendingId === book.id}
                    showApprovalActions={activeTab === "PENDING" || book.status === "SUBMITTED"}
                    onApprove={() => handleApprove(book.id, "APPROVED")}
                    onReject={() => handleApprove(book.id, "REJECTED")}
                    onViewDetail={() => setDetailBook(book)}
                    onDelete={() => setBookToDelete(book)}
                  />
                ))}
              </tbody>
            </table>
            {!displayedBooks.length && (
              <div className="py-12 text-center text-slate-500">
                {activeTab === "PENDING"
                  ? "No books are currently awaiting review."
                  : "No books match your search."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {detailBook && (
        <BookDetailDialog
          book={detailBook}
          isPending={pendingId === detailBook.id}
          onApprove={() => {
            handleApprove(detailBook.id, "APPROVED");
            setDetailBook(null);
          }}
          onReject={() => {
            handleApprove(detailBook.id, "REJECTED");
            setDetailBook(null);
          }}
          onDelete={() => setBookToDelete(detailBook)}
          onClose={() => setDetailBook(null)}
        />
      )}

      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !isDeleting && setBookToDelete(null)}>
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Book</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to remove <span className="font-semibold text-slate-900">"{bookToDelete.title}"</span>? This will permanently delete this book, its associated formats, and files from the library.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBookToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4 mr-1.5" />
                    Confirm Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookRow({
  book,
  isPending,
  showApprovalActions = false,
  onApprove,
  onReject,
  onViewDetail,
  onDelete,
}: {
  book: AdminPendingBook;
  isPending: boolean;
  showApprovalActions?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onViewDetail: () => void;
  onDelete: () => void;
}) {
  const authorName = book.author?.profile
    ? `${book.author.profile.firstName || ""} ${book.author.profile.lastName || ""}`.trim()
    : null;

  const displayName = book.authorName || authorName || book.author?.username || "Unknown Author";

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          {book.bookCover ? (
            <div
              className="h-16 w-12 rounded bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url(${book.bookCover})` }}
            />
          ) : (
            <div className="h-16 w-12 rounded bg-slate-200 flex items-center justify-center">
              <span className="text-xs text-slate-400">No cover</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">{book.title}</p>
            {book.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[250px]">
                {book.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {book.isbn && (
                <span className="text-xs text-slate-400">ISBN: {book.isbn}</span>
              )}
              {book.category && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {book.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <Link
            href={`/admin-dashboard/authors/${book.author?.id || book.authorId}`}
            className="text-sm font-medium text-slate-900 hover:text-[#a88922] inline-flex items-center gap-1"
          >
            {displayName}
            <ExternalLink className="size-3 text-slate-400" />
          </Link>
          <span className="text-xs text-slate-500 mt-0.5">@{book.author?.username || "platform"}</span>
          {book.author?.email && (
            <span className="text-xs text-slate-400 mt-0.5">{book.author.email}</span>
          )}
          {book.author?.isFoundingAuthor && (
            <span className="mt-1 inline-flex w-fit rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
              Founding Author
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1 text-sm text-slate-700">
          {book.formats.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="font-medium text-slate-900">{f.formatType}</span>
              <span className="text-slate-500">${f.listPrice.toFixed(2)}</span>
              {f.pageCount && (
                <span className="text-xs text-slate-400">({f.pageCount} pages)</span>
              )}
              {f.trimSize && (
                <span className="text-xs text-slate-400">{f.trimSize}</span>
              )}
            </span>
          ))}
          {!book.formats.length && <span className="text-slate-400">—</span>}
        </div>
      </td>
      <td className="p-4">
        {book.status === "APPROVED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle className="size-3 text-emerald-500" />
            Live in App
          </span>
        ) : book.status === "SUBMITTED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
            Awaiting Review
          </span>
        ) : book.status === "REJECTED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
            Rejected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            Draft
          </span>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="text-slate-700 hover:bg-slate-50"
            onClick={onViewDetail}
            title="View details"
          >
            <Eye className="size-4 mr-1" />
            View
          </Button>

          <Link
            href={`/admin-dashboard/books/upload?bookId=${book.id}`}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
            title="Edit book"
          >
            <Pencil className="size-3.5 mr-1 text-slate-500" />
            Edit
          </Link>

          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onDelete}
            title="Remove book"
          >
            <Trash2 className="size-3.5 mr-1" />
            Remove
          </Button>

          {showApprovalActions && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={onReject}
                disabled={isPending}
              >
                <XCircle className="size-4 mr-1.5" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onApprove}
                disabled={isPending}
              >
                <CheckCircle className="size-4 mr-1.5" />
                Approve
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function BookDetailDialog({
  book,
  isPending,
  onApprove,
  onReject,
  onDelete,
  onClose,
}: {
  book: AdminPendingBook;
  isPending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const authorName = book.author?.profile
    ? `${book.author.profile.firstName || ""} ${book.author.profile.lastName || ""}`.trim()
    : null;
  const displayName = book.authorName || authorName || book.author?.username || "Unknown Author";

  const tagList = book.tags?.length ? book.tags : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">Book Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="size-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            {book.bookCover ? (
              <img
                src={book.bookCover}
                alt={book.title}
                className="h-40 w-28 rounded object-cover shadow"
              />
            ) : (
              <div className="h-40 w-28 rounded bg-slate-200 flex items-center justify-center">
                <span className="text-sm text-slate-400">No cover</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{book.title}</h3>
              {book.description && (
                <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{book.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {book.isbn && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">ISBN: {book.isbn}</span>
                )}
                {book.category && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{book.category}</span>
                )}
                {book.language && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{book.language}</span>
                )}
                {book.ageGroup && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{book.ageGroup}</span>
                )}
              </div>
              {tagList.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tagList.map((tag, i) => (
                    <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Formats & Pricing</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {book.formats.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
                  <div>
                    <span className="font-medium text-slate-900">{f.formatType}</span>
                    {f.pageCount && (
                      <span className="ml-2 text-xs text-slate-500">{f.pageCount} pages</span>
                    )}
                    {f.trimSize && (
                      <span className="ml-2 text-xs text-slate-500">{f.trimSize}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-900">${f.listPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Submitted Files</h4>
            <div className="grid gap-2">
              <FileLink
                label="Book Cover"
                url={book.bookCover}
                icon={<ImageIcon className="size-4" />}
              />
              <FileLink
                label="eBook File"
                url={getBookFileUrl(book, "EBOOK")}
                icon={<FileText className="size-4" />}
              />
              <FileLink
                label="Audiobook File"
                url={getBookFileUrl(book, "AUDIOBOOK")}
                icon={<FileAudio className="size-4" />}
              />
              <FileLink
                label="Interior PDF (Print)"
                url={getBookFileUrl(book, "INTERIOR_PDF")}
                icon={<FileText className="size-4" />}
              />
              <FileLink
                label="Cover PDF (Print)"
                url={getBookFileUrl(book, "COVER_PDF")}
                icon={<FileText className="size-4" />}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Author Information</h4>
            <div className="flex items-start gap-4">
              {book.author?.profile?.avatarUrl ? (
                <img
                  src={book.author.profile.avatarUrl}
                  alt={displayName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-500">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/admin-dashboard/authors/${book.author?.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-[#a88922] inline-flex items-center gap-1"
                >
                  {displayName}
                  <ExternalLink className="size-4 text-slate-400" />
                </Link>
                <p className="text-sm text-slate-500">@{book.author?.username}</p>
                {book.author?.email && (
                  <p className="text-sm text-slate-500">{book.author.email}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {book.author?.isFoundingAuthor && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      Founding Author
                    </span>
                  )}
                </div>
                {book.author?.profile?.bio && (
                  <p className="mt-2 text-sm text-slate-600">{book.author.profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Submission Info</h4>
            <div className="flex gap-4 text-sm text-slate-600">
              <span>Created: {new Date(book.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(book.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin-dashboard/books/upload?bookId=${book.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Pencil className="size-4 mr-1.5 text-slate-500" />
              Edit Book
            </Link>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={onDelete}
            >
              <Trash2 className="size-4 mr-1.5" />
              Remove Book
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={onReject}
              disabled={isPending}
            >
              <XCircle className="size-4 mr-1.5" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onApprove}
              disabled={isPending}
            >
              <CheckCircle className="size-4 mr-1.5" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileLink({
  label,
  url,
  icon,
}: {
  label: string;
  url: string | null;
  icon: React.ReactNode;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded bg-slate-50 px-3 py-2 text-sm text-slate-400">
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-xs">Not uploaded</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
    >
      {icon}
      <span>{label}</span>
      <Download className="size-3 ml-auto" />
    </a>
  );
}
