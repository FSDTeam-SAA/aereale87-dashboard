import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAuthors } from "@/features/admin-dashboard/authors/api/authors.api";
import { AdminUploadBookPage } from "@/features/admin-dashboard/books/components/admin-upload-book-page";
import type { PaginatedAuthors } from "@/features/admin-dashboard/authors/types";

export const dynamic = "force-dynamic";

export default async function AdminUploadBookRoute({
  searchParams,
}: {
  searchParams?: Promise<{ bookId?: string }> | { bookId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const bookId = resolvedSearchParams?.bookId;

  let authorsData: PaginatedAuthors = {
    authors: [],
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1,
  };

  try {
    authorsData = await getAuthors(session.accessToken);
  } catch (error) {
    console.error("[books-upload] Error loading authors list:", error);
  }

  return (
    <AdminUploadBookPage
      authors={authorsData.authors}
      accessToken={session.accessToken}
      bookId={bookId}
    />
  );
}
